import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * Djot Abbreviation extension for Tiptap
 *
 * Renders inline abbreviations with the `<abbr>` tag.
 * Serializes to Djot as: [ABBR]{abbr="Full Text"}
 *
 * @example
 * ```js
 * // In editor
 * <abbr title="HyperText Markup Language">HTML</abbr>
 *
 * // Djot output
 * [HTML]{abbr="HyperText Markup Language"}
 * ```
 */
export const DjotAbbreviation = Mark.create({
    name: 'djotAbbreviation',

    addAttributes() {
        return {
            title: {
                default: null,
                parseHTML: element => element.getAttribute('title'),
                renderHTML: attributes => {
                    if (!attributes.title) return {};
                    return { title: attributes.title };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'abbr[title]',
                priority: 51,
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['abbr', mergeAttributes(HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setAbbreviation: attributes => ({ commands }) => {
                return commands.setMark(this.name, attributes);
            },
            toggleAbbreviation: attributes => ({ commands }) => {
                return commands.toggleMark(this.name, attributes);
            },
            unsetAbbreviation: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
        };
    },

    addKeyboardShortcuts() {
        return {
            // Auto-exit abbreviation mark when pressing space
            'Space': () => {
                if (this.editor.isActive(this.name)) {
                    this.editor.commands.unsetMark(this.name);
                    return false; // Let space be typed normally
                }
                return false;
            },
        };
    },
});

export default DjotAbbreviation;
