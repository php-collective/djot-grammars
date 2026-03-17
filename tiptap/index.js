/**
 * Djot Grammars - Tiptap Integration
 *
 * Provides Djot markup support for Tiptap editors.
 *
 * @example Basic usage with DjotKit
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
 * @example Using individual extensions
 * ```js
 * import { Editor } from '@tiptap/core'
 * import StarterKit from '@tiptap/starter-kit'
 * import { DjotInsert, DjotDelete, DjotDiv, serializeToDjot } from 'djot-grammars/tiptap'
 *
 * const editor = new Editor({
 *   extensions: [
 *     StarterKit,
 *     DjotInsert,
 *     DjotDelete,
 *     DjotDiv,
 *   ],
 * })
 * ```
 *
 * @module djot-grammars/tiptap
 */

// Main kit
export { DjotKit } from './djot-kit.js';

// Individual extensions
export { DjotInsert } from './extensions/djot-insert.js';
export { DjotDelete } from './extensions/djot-delete.js';
export { DjotDiv } from './extensions/djot-div.js';

// Serializer
export { serializeToDjot, escapeDjot } from './serializer.js';
