/* Nested outgoing links extractor for "The Archive" app

License: CC-BY-4.0
Author: JW

*/

"use strict";

const uidSet = new Set();
const selected = input.text.selected;

const getHeader = content => 
    content.match(/(?:^|\n)# (.+)/)?.[1] ?? "<No H1 header>";

const getNoteData = (filename, content) => {
    const [_, id, desc] = filename.match(/^(\d{6,}\S*)\s*(.*)/) ?? [];
    return id ? { id, desc: desc.trim() || getHeader(content) } : null;
}

const findNote = id => {
    const m = app.search(id, false).bestMatch;
    return m?.filename.startsWith(id) && m;
}
const extractLink = text => text.match(/\[\[(.*?)\]\]/)?.[1];
const getOutLinks = content => content.match(/(?<=\[\[).+?(?=\]\])/g) ?? [];

const nest = (link, depth, indent) => {
    let note;
    if (depth < 0 || uidSet.has(link) || !(note = findNote(link)))
        return "";

    uidSet.add(link);
    const data = getNoteData(note.filename, note.content);

    const line = data
        ? `${indent}- ${data.desc} [[${data.id}]]\n`
        : `${indent}- <Error: Invalid ID> [[${link}]]\n`;

    return line + getOutLinks(note.content)
        .map(l => nest(l, depth - 1, `  ${indent}`))
        .join("");
}

const depth = parseInt(app.prompt({title: "Depth", defaultValue: 4}));
const root = extractLink(selected);

if (!(depth > 0) || !root) cancel("Invalid depth or link");

const out = nest(root, depth, "");
output.insert.text = out;

