import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
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

import { DjotInsert } from './extensions/djot-insert.js';
import { DjotDelete } from './extensions/djot-delete.js';
import { DjotDiv } from './extensions/djot-div.js';

/**
 * DjotKit - A Tiptap extension bundle for Djot markup
 *
 * Includes all standard Tiptap extensions plus Djot-specific marks:
 * - DjotInsert: {+text+}
 * - DjotDelete: {-text-}
 * - DjotDiv: ::: containers
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
                codeBlock: this.options.codeBlock ?? {
                    HTMLAttributes: {
                        spellcheck: 'false',
                    },
                },
                ...this.options.starterKit,
            }));
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

        // Task list extensions
        if (this.options.taskList !== false) {
            extensions.push(TaskList.configure(this.options.taskList ?? {}));
            extensions.push(TaskItem.configure({
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

        return extensions;
    },
});

export default DjotKit;
