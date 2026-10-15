import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {isAllowedMarkdownLink} from "./Markdown";

// Descriptions written by container developers predate markdown support, so only inline
// formatting is parsed. Block syntax stays literal text ("- flag", "# note"), and so do
// constructs that would otherwise mangle common C2 text:
//   htmlText/htmlFlow  - keeps usage placeholders like <path> instead of dropping them as HTML
//   characterEscape    - keeps \\server\share and C:\Windows\* intact
//   labelStartImage    - no remote image loads from description text
const disabledConstructs = [
    "blockQuote", "codeFenced", "codeIndented", "definition", "headingAtx", "list",
    "setextUnderline", "thematicBreak", "table", "gfmFootnoteDefinition", "gfmFootnoteCall",
    "gfmPotentialFootnoteCall", "htmlFlow", "htmlText", "characterEscape", "labelStartImage",
];
function remarkInlineOnly() {
    const data = this.data();
    if(!data.micromarkExtensions){
        data.micromarkExtensions = [];
    }
    data.micromarkExtensions.push({disable: {null: disabledConstructs}});
}
const inlineMarkdownPlugins = [remarkGfm, remarkInlineOnly];
const inlineMarkdownElements = ["p", "strong", "em", "del", "code", "a", "br"];
const inlineMarkdownComponents = {
    p: ({children}) => <span className="mythic-inline-markdown-paragraph">{children}</span>,
    code: ({children}) => <code className="mythic-inline-markdown-code rounded">{children}</code>,
    a: ({href, children}) => {
        if(!isAllowedMarkdownLink(href)){
            return children;
        }
        return (
            <a className="mythic-inline-markdown-link" href={href} target="_blank" rel="noopener noreferrer"
               onClick={(e) => e.stopPropagation()}>
                {children}
            </a>
        );
    },
};

export const MythicInlineMarkdown = React.memo(({value}) => {
    if(typeof value !== "string" || value.length === 0){
        return value ?? null;
    }
    return (
        <span className="mythic-inline-markdown">
            <ReactMarkdown remarkPlugins={inlineMarkdownPlugins}
                           components={inlineMarkdownComponents}
                           allowedElements={inlineMarkdownElements}
                           unwrapDisallowed
                           skipHtml>
                {value}
            </ReactMarkdown>
        </span>
    );
});
