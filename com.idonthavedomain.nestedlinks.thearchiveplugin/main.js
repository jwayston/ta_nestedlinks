/* Nested outgoing links extractor for "The Archive" app

License: CC-BY-4.0
Author: JW

*/

"use strict";

const regexLink = new RegExp(/\[\[(.*)\]\]/);
const regexNoteHeader = new RegExp("(?<=^|\\n)# (.+)\\n");
const regexForwardLinks = new RegExp(/(\[\[.*\]\])/g);
const regexIndent = new RegExp(/^(\s+)/);


function getIndent(text)
{
	const indentMatch = text.match(regexIndent);

	if (indentMatch === null)
		return "";

	return indentMatch[1];
}

function extractHeader(noteContent)
{
	const headerMatch = noteContent.match(regexNoteHeader);
	return headerMatch === null ? "<No H1 header detected>" : headerMatch[1];
}

function extractNoteHeader(noteId)
{
	const note = app.search(noteId, false).bestMatch;
	return note === null ? "<Note not found>" : extractHeader(note.content);
}

function extractLinkTarget(text)
{
	const linkMatch = text.match(regexLink);
	return linkMatch === null ? null : linkMatch[1];
}

function findForwardLinks(noteId)
{
	const note = app.search(noteId, false).bestMatch;

	if (note === null)
		return null;

	// Skip currently open note
	if (note.filename === input.notes.selected[0].filename)
		return "";

	const forwardLinksMatch = note.content.match(regexForwardLinks);
	if (forwardLinksMatch === null)
		return null;

	return forwardLinksMatch;
}

function extractIndentedForwardLinks(textLine)
{
	const initialIndent = getIndent(textLine);
	const targetNoteId = extractLinkTarget(textLine);
	let outputText = "";

	if (targetNoteId === null)
		return `${textLine} <Couldn't extract target note ID from the link>`;

	const forwardLinks = findForwardLinks(targetNoteId);

	if (forwardLinks === null)
		return textLine;

	outputText += textLine;
	outputText += textLine.slice(-1) !== "\n" ? "\n" : "";

	for (let link of forwardLinks)
	{
		const linkId = extractLinkTarget(link);
		const linkHeader = extractNoteHeader(linkId);
		outputText += `${initialIndent}  - ${linkHeader} ${link}\n`;
	}

	return outputText;
}

output.insert.text = extractIndentedForwardLinks(input.text.selected);
