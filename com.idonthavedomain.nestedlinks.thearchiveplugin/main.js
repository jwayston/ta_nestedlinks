/* Nested outgoing links extractor for "The Archive" app

License: CC-BY-4.0
Author: JW

*/

"use strict";

const INDENT = 2;
const regexWikilinks = new RegExp(/(\[\[.*?\]\])/g);
const regexWikilinkTarget = new RegExp(/\[\[(.*?)\]\]/);
const regexIndent = new RegExp(/^(\s+)/);

/* 
+------------------------------------------------------------------------------+
|                             <header extraction>                              |
+------------------------------------------------------------------------------+
*/
const currentNote = input.notes.selected[0].filename;
const regexIdDesc = new RegExp(/([0-9]{12,}|[0-9]{6,}.*?(?=\s|$)|.*?(?=\s|$))\s?(.*)/);
const regexNoteHeader = new RegExp("(?<=^|\\n)# (.+)\\n");

function extractHeader(noteContent)
{
    const headerMatch = noteContent.match(regexNoteHeader);
    return !headerMatch ? "<No H1 header detected>" : headerMatch[1];
}

function extractNoteHeaderLinkPair(linkText, excludeFilePattern)
{
    let matchIdDesc;
    let noteFound = false;
    const searchBestMatch = app.search(linkText).bestMatch;

    if (searchBestMatch)
        if(!searchBestMatch.filename.match(excludeFilePattern))
            noteFound = true;

    if (noteFound)
        matchIdDesc = searchBestMatch.filename.match(regexIdDesc);
    else
        return null;

    if (!matchIdDesc)
        return `<Error: cannot extract any remotely ID-like from the link> ${selection}`;

    const id = matchIdDesc[1];
    const desc = matchIdDesc[2];

    if (!desc && noteFound)
        return `${extractHeader(searchBestMatch.content)} [[${id}]]`;

    return `${desc} [[${id}]]`;
}
/* 
+------------------------------------------------------------------------------+
|                             </header extraction>                             |
+------------------------------------------------------------------------------+
*/

function getIndent(text)
{
    const indentMatch = text.match(regexIndent);
    return !indentMatch ? "" : indentMatch[1];
}

function extractLinkTarget(text)
{
    const linkMatch = text.match(regexWikilinkTarget);
    return !linkMatch ? linkMatch : linkMatch[1];
}

function findOutgoingLinks(noteId, excludeNoteId)
{
    const note = app.search(noteId, false).bestMatch;
    if (!note)
        return null;

    const matchOutgoingLinks = note.content.match(regexWikilinks);
    return !matchOutgoingLinks ? null : matchOutgoingLinks;
}

function extractNestedOutgoingLinks(textLine, depth)
{
    if (depth === 0)
        return "";

    let outputText = "";
    const initialIndent = getIndent(textLine);
    const linkTarget = extractLinkTarget(textLine);

    if (!linkTarget)
        return `${textLine} <Couldn't extract link target>`;

    const outgoingLinks = findOutgoingLinks(linkTarget);
    if (!outgoingLinks)
        return outputText;

    uidSet.add(linkTarget);

    // Go through detected outgoing links
    for (let outLink of outgoingLinks)
    {
        const outLinkTarget = extractLinkTarget(outLink);
        const linkExpanded = extractNoteHeaderLinkPair(outLinkTarget, linkTarget);

        // Do not repeat outgoing link if it was already shown before
        if (uidSet.has(outLinkTarget))
            continue;

        // Skip non-working links
        if (!linkExpanded)
            continue;

        const outputLine = `${initialIndent}${" ".repeat(INDENT)}- ${linkExpanded}\n`;
        outputText += outputLine;
        outputText += extractNestedOutgoingLinks(outputLine, depth - 1);
        uidSet.add(outLinkTarget);
    }

    return outputText;
}


let uidSet = new Set();  // Keep track of visited notes
let outputText = input.text.selected;

const depth = parseInt(app.prompt({
    title: "Depth",
    description: "How many levels deep do you want to dive in?",
    placeholder: "Depth",
    defaultValue: 4
}));

if (!Number.isInteger(depth) || depth < 1)
    cancel("Given depth was not a valid integer value");

outputText += outputText.slice(-1) !== "\n" ? "\n" : "";
outputText += extractNestedOutgoingLinks(input.text.selected, depth);
output.insert.text = outputText;

