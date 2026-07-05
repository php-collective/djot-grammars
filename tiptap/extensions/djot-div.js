import { Node, mergeAttributes } from '@tiptap/core';

/**
 * First direct child that carries the admonition-title class (djot-php's
 * AdmonitionExtension renders the container title as such a paragraph).
 */
function findTitleChild(element) {
    for (const child of element.children || []) {
        if (child.classList && child.classList.contains('admonition-title')) {
            return child;
        }
    }
    return null;
}

/**
 * Content for the node: everything except the title paragraph, which is
 * captured as the `title` attribute instead (else it would duplicate into the
 * body and the {title="..."} attribute would be lost on serialization).
 */
function contentWithoutTitle(element) {
    if (!findTitleChild(element)) {
        return element;
    }
    const clone = element.cloneNode(true);
    findTitleChild(clone).remove();
    return clone;
}

/**
 * Djot Div container node extension for Tiptap
 *
 * Renders as ::: class in Djot markup, with an optional admonition title
 * ({title="Custom title"} attribute line before the opener) kept in the
 * `title` attribute
 *
 * @example
 * ```js
 * import { DjotDiv } from 'djot-grammars/tiptap'
 *
 * const editor = new Editor({
 *   extensions: [DjotDiv],
 * })
 *
 * // Wrap selection in a div container
 * editor.chain().focus().setDjotDiv({ class: 'warning' }).run()
 * ```
 */
export const DjotDiv = Node.create({
    name: 'djotDiv',

    group: 'block',

    content: 'block+',

    defining: true,

    addAttributes() {
        return {
            class: {
                default: null,
                parseHTML: element => element.getAttribute('data-djot-class') || element.className.replace('djot-div', '').trim() || null,
                renderHTML: attributes => {
                    if (!attributes.class) return {};
                    return { 'data-djot-class': attributes.class };
                },
            },
            title: {
                default: null,
                // An empty string is meaningful ({title=""} renders an empty
                // title paragraph instead of the default one), so only a
                // missing title maps to null.
                parseHTML: element => {
                    const attr = element.getAttribute('data-djot-title');
                    if (attr !== null) return attr;
                    // djot-php round-trip mode: data-djot-admonition-title is
                    // only set for a custom {title="..."}; its absence on a
                    // marked admonition means the title paragraph is
                    // auto-generated and must not be frozen into the source.
                    const rtAttr = element.getAttribute('data-djot-admonition-title');
                    if (rtAttr !== null) return rtAttr;
                    if (element.hasAttribute('data-djot-admonition-type')) return null;
                    const child = findTitleChild(element);
                    return child ? child.textContent.trim() : null;
                },
                renderHTML: attributes => {
                    if (attributes.title == null) return {};
                    return { 'data-djot-title': attributes.title };
                },
            },
        };
    },

    parseHTML() {
        return [
            { tag: 'div.djot-div', contentElement: contentWithoutTitle },
            // Also match common container classes rendered by djot-php
            { tag: 'div.note', contentElement: contentWithoutTitle },
            { tag: 'div.tip', contentElement: contentWithoutTitle },
            { tag: 'div.warning', contentElement: contentWithoutTitle },
            { tag: 'div.danger', contentElement: contentWithoutTitle },
            { tag: 'div.info', contentElement: contentWithoutTitle },
            // Match any div with a single class (likely a ::: container)
            {
                tag: 'div[class]',
                contentElement: contentWithoutTitle,
                getAttrs: element => {
                    // Only match divs with a simple class (not complex component divs)
                    const className = element.className;
                    // Skip if it looks like a WordPress/editor component
                    if (className.includes('wp-') || className.includes('block-') ||
                        className.includes('editor-') || className.includes('is-')) {
                        return false;
                    }
                    // Skip Torchlight code block line divs
                    if (className === 'line' || className.includes('line-')) {
                        return false;
                    }
                    // Skip if inside a pre or code element (syntax highlighting)
                    if (element.closest('pre') || element.closest('code')) {
                        return false;
                    }
                    // Accept single-word classes or djot-div
                    if (/^[a-z-]+$/i.test(className) || className.includes('djot-div')) {
                        return {};
                    }
                    return false;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const classes = ['djot-div'];
        if (HTMLAttributes['data-djot-class']) {
            classes.push(HTMLAttributes['data-djot-class']);
        }
        return ['div', mergeAttributes(HTMLAttributes, { class: classes.join(' ') }), 0];
    },

    addCommands() {
        return {
            setDjotDiv: (attributes) => ({ commands }) => {
                return commands.wrapIn(this.name, attributes);
            },
            toggleDjotDiv: (attributes) => ({ commands }) => {
                return commands.toggleWrap(this.name, attributes);
            },
            unsetDjotDiv: () => ({ commands }) => {
                return commands.lift(this.name);
            },
        };
    },
});

export default DjotDiv;
