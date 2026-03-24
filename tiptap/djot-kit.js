import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';

import { DjotInsert } from './extensions/djot-insert.js';
import { DjotDelete } from './extensions/djot-delete.js';
import { DjotDiv } from './extensions/djot-div.js';
import { DjotSpan } from './extensions/djot-span.js';
import { DjotFootnote } from './extensions/djot-footnote.js';
import { DjotEmbed } from './extensions/djot-embed.js';

/**
 * DjotKit - A Tiptap extension bundle for Djot markup
 *
 * Includes all standard Tiptap extensions plus Djot-specific marks:
 * - DjotInsert: {+text+}
 * - DjotDelete: {-text-}
 * - DjotDiv: ::: containers
 * - DjotSpan: [text]{.class}
 * - DjotFootnote: [^label]
 * - DjotEmbed: video/iframe embeds
 *
 * @example
 * ```js
 * import { Editor } from '@tiptap/core'
 * import { DjotKit, serializeToDjot } from 'djot-grammars/tiptap'
 *
 * const editor = new Editor({
 *   element: document.getElementById('editor'),
 *   extensions: [DjotKit],
 *   onUpdate: ({ editor }) => {
 *     const djot = serializeToDjot(editor.getJSON())
 *     console.log(djot)
 *   },
 * })
 * ```
 *
 * @example Configuration
 * ```js
 * import { DjotKit } from 'djot-grammars/tiptap'
 *
 * // Disable specific features
 * DjotKit.configure({
 *   table: false,
 *   taskList: false,
 * })
 *
 * // Configure specific extensions
 * DjotKit.configure({
 *   link: {
 *     openOnClick: false,
 *   },
 *   codeBlock: {
 *     HTMLAttributes: {
 *       spellcheck: 'false',
 *     },
 *   },
 * })
 * ```
 */
export const DjotKit = Extension.create({
    name: 'djotKit',

    addExtensions() {
        const extensions = [];

        // StarterKit provides: Document, Paragraph, Text, Bold, Italic, Code,
        // CodeBlock, Blockquote, BulletList, OrderedList, ListItem, Heading,
        // HardBreak, HorizontalRule, Dropcursor, Gapcursor, History
        if (this.options.starterKit !== false) {
            extensions.push(StarterKit.configure({
                // Disable CodeBlock from StarterKit, we add a custom one below
                codeBlock: false,
                // Disable default lists - we add custom ones that handle task-list
                bulletList: false,
                listItem: false,
                ...this.options.starterKit,
            }));
        }

        // Custom CodeBlock that preserves data-language-raw for syntax highlighter options
        if (this.options.codeBlock !== false) {
            const CustomCodeBlock = CodeBlock.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        languageRaw: {
                            default: null,
                            parseHTML: element => {
                                // Check parent <pre> for data-language-raw
                                const pre = element.closest('pre');
                                return pre?.getAttribute('data-language-raw') || null;
                            },
                            renderHTML: attributes => {
                                if (!attributes.languageRaw) return {};
                                return { 'data-language-raw': attributes.languageRaw };
                            },
                        },
                    };
                },
            });
            extensions.push(CustomCodeBlock.configure({
                HTMLAttributes: {
                    spellcheck: 'false',
                },
                ...this.options.codeBlock,
            }));
        }

        // Custom BulletList that excludes task-list class
        if (this.options.bulletList !== false) {
            const CustomBulletList = BulletList.extend({
                parseHTML() {
                    return [
                        {
                            tag: 'ul',
                            getAttrs: element => {
                                // Don't match task-list - let TaskList handle those
                                if (element.classList.contains('task-list')) {
                                    return false;
                                }
                                return {};
                            },
                        },
                    ];
                },
            });
            extensions.push(CustomBulletList.configure(this.options.bulletList ?? {}));
        }

        // Custom ListItem that excludes task items (those with checkboxes)
        if (this.options.listItem !== false) {
            const CustomListItem = ListItem.extend({
                parseHTML() {
                    return [
                        {
                            tag: 'li',
                            getAttrs: element => {
                                // Don't match list items with checkboxes - let TaskItem handle those
                                const checkbox = element.querySelector('input[type="checkbox"]');
                                if (checkbox) {
                                    return false;
                                }
                                return {};
                            },
                        },
                    ];
                },
            });
            extensions.push(CustomListItem.configure(this.options.listItem ?? {}));
        }

        // Highlight mark (built-in, maps to {=text=})
        if (this.options.highlight !== false) {
            extensions.push(Highlight.configure(this.options.highlight ?? {}));
        }

        // Subscript mark (maps to ~text~)
        if (this.options.subscript !== false) {
            extensions.push(Subscript.configure(this.options.subscript ?? {}));
        }

        // Superscript mark (maps to ^text^)
        if (this.options.superscript !== false) {
            extensions.push(Superscript.configure(this.options.superscript ?? {}));
        }

        // Link extension with keyboard shortcut
        if (this.options.link !== false) {
            extensions.push(
                Link.configure({
                    openOnClick: false,
                    ...this.options.link,
                }).extend({
                    addKeyboardShortcuts() {
                        return {
                            'Mod-Shift-k': () => {
                                if (this.editor.isActive('link')) {
                                    return this.editor.chain().focus().unsetLink().run();
                                }
                                const url = prompt('Enter URL:');
                                if (url) {
                                    return this.editor.chain().focus().setLink({ href: url }).run();
                                }
                                return false;
                            },
                        };
                    },
                })
            );
        }

        // Image extension
        if (this.options.image !== false) {
            extensions.push(Image.configure(this.options.image ?? {}));
        }

        // Table extensions
        if (this.options.table !== false) {
            extensions.push(Table.configure({
                resizable: true,
                ...this.options.table,
            }));
            extensions.push(TableRow.configure(this.options.tableRow ?? {}));
            extensions.push(TableCell.configure(this.options.tableCell ?? {}));
            extensions.push(TableHeader.configure(this.options.tableHeader ?? {}));
        }

        // Task list extensions - extend to match PHP output format
        if (this.options.taskList !== false) {
            // Extend TaskList to also match ul.task-list with high priority
            const CustomTaskList = TaskList.extend({
                parseHTML() {
                    return [
                        { tag: 'ul[data-type="taskList"]', priority: 60 },
                        { tag: 'ul.task-list', priority: 60 },
                    ];
                },
            });
            extensions.push(CustomTaskList.configure(this.options.taskList ?? {}));

            // Extend TaskItem to also match li with checkbox input with high priority
            const CustomTaskItem = TaskItem.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        checked: {
                            default: false,
                            keepOnSplit: false,
                            parseHTML: element => {
                                // First check data-checked attribute
                                const dataChecked = element.getAttribute('data-checked');
                                if (dataChecked !== null) {
                                    return dataChecked === 'true';
                                }
                                // Then check for checkbox input
                                const checkbox = element.querySelector('input[type="checkbox"]');
                                return checkbox?.hasAttribute('checked') || false;
                            },
                            renderHTML: attributes => ({
                                'data-checked': attributes.checked,
                            }),
                        },
                    };
                },
                parseHTML() {
                    return [
                        { tag: 'li[data-type="taskItem"]', priority: 60 },
                        // Match list items that contain a checkbox input
                        {
                            tag: 'li',
                            priority: 60,
                            getAttrs: element => {
                                const checkbox = element.querySelector('input[type="checkbox"]');
                                if (checkbox) return {};
                                return false;
                            },
                        },
                    ];
                },
            });
            extensions.push(CustomTaskItem.configure({
                nested: true,
                ...this.options.taskItem,
            }));
        }

        // Djot-specific extensions
        if (this.options.djotInsert !== false) {
            extensions.push(DjotInsert.configure(this.options.djotInsert ?? {}));
        }

        if (this.options.djotDelete !== false) {
            extensions.push(DjotDelete.configure(this.options.djotDelete ?? {}));
        }

        if (this.options.djotDiv !== false) {
            extensions.push(DjotDiv.configure(this.options.djotDiv ?? {}));
        }

        // Span with class mark (maps to [text]{.class})
        if (this.options.djotSpan !== false) {
            extensions.push(DjotSpan.configure(this.options.djotSpan ?? {}));
        }

        // Footnote reference node (maps to [^label])
        if (this.options.djotFootnote !== false) {
            extensions.push(DjotFootnote.configure(this.options.djotFootnote ?? {}));
        }

        // Embed node (preserves videos, oEmbed content)
        if (this.options.djotEmbed !== false) {
            extensions.push(DjotEmbed.configure(this.options.djotEmbed ?? {}));
        }

        return extensions;
    },
});

export default DjotKit;
