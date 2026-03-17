# Tiptap Djot Integration

Djot markup support for [Tiptap](https://tiptap.dev) editors.

## Features

- **DjotKit** - All-in-one extension bundle (like StarterKit)
- **Djot Extensions** - Insert `{+text+}`, Delete `{-text-}`, Div containers `:::`
- **Serializer** - Convert ProseMirror documents to Djot markup
- Full Djot syntax support including tables, task lists, and code blocks

## Installation

```bash
npm install djot-grammars @tiptap/core @tiptap/starter-kit
```

For full features, also install:

```bash
npm install @tiptap/extension-highlight @tiptap/extension-subscript @tiptap/extension-superscript @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-task-list @tiptap/extension-task-item
```

## Quick Start

```js
import { Editor } from '@tiptap/core'
import { DjotKit, serializeToDjot } from 'djot-grammars/tiptap'

const editor = new Editor({
  element: document.getElementById('editor'),
  extensions: [DjotKit],
  onUpdate: ({ editor }) => {
    const djot = serializeToDjot(editor.getJSON())
    document.getElementById('output').textContent = djot
  },
})
```

## Configuration

Disable or configure specific features:

```js
import { DjotKit } from 'djot-grammars/tiptap'

const editor = new Editor({
  extensions: [
    DjotKit.configure({
      // Disable features
      table: false,
      taskList: false,

      // Configure extensions
      link: {
        openOnClick: false,
      },
      codeBlock: {
        HTMLAttributes: {
          spellcheck: 'false',
        },
      },
    }),
  ],
})
```

## Using Individual Extensions

For more control, use extensions individually:

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { DjotInsert, DjotDelete, DjotDiv, serializeToDjot } from 'djot-grammars/tiptap'

const editor = new Editor({
  extensions: [
    StarterKit,
    DjotInsert,
    DjotDelete,
    DjotDiv,
  ],
})

// Toggle marks
editor.chain().focus().toggleDjotInsert().run()  // {+text+}
editor.chain().focus().toggleDjotDelete().run()  // {-text-}
editor.chain().focus().setDjotDiv({ class: 'warning' }).run()  // ::: warning
```

## Djot Output Examples

| Editor Action | Djot Output |
|---------------|-------------|
| Bold | `*text*` |
| Italic | `_text_` |
| Code | `` `text` `` |
| Highlight | `{=text=}` |
| Insert | `{+text+}` |
| Delete | `{-text-}` |
| Superscript | `^text^` |
| Subscript | `~text~` |
| Link | `[text](url)` |
| Code block | ``` php` (with space) |
| Div container | `::: class` |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+K` | Toggle link |
| `Ctrl+Shift+I` | Toggle insert mark |
| `Ctrl+Shift+D` | Toggle delete mark |

## API Reference

### DjotKit

Extension bundle with all Djot features. Includes StarterKit plus:

- Highlight, Subscript, Superscript
- Link with keyboard shortcut
- Image
- Table, TableRow, TableCell, TableHeader
- TaskList, TaskItem
- DjotInsert, DjotDelete, DjotDiv

### serializeToDjot(doc)

Converts a Tiptap/ProseMirror JSON document to Djot markup.

```js
const djot = serializeToDjot(editor.getJSON())
```

### escapeDjot(text)

Escapes special Djot characters in plain text.

```js
const safe = escapeDjot('*bold* and _italic_')
// Returns: \*bold\* and \_italic\_
```

## CSS Styles

Add styles for Djot-specific marks:

```css
.djot-insert {
  color: #4ade80;
  border-bottom: 1px dashed #4ade80;
}

.djot-delete {
  color: #f87171;
  text-decoration: line-through;
}

.djot-div {
  border-left: 3px solid #8b5cf6;
  padding: 12px 16px;
  margin: 1em 0;
  background: #f5f5ff;
}

.djot-div.warning {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.djot-div.tip {
  border-left-color: #10b981;
  background: #ecfdf5;
}

.djot-div.danger {
  border-left-color: #ef4444;
  background: #fef2f2;
}
```

## Demo

See `demo/index.html` for a full working example. Serve it with any HTTP server:

```bash
cd tiptap
npx serve .
# Open http://localhost:3000/demo/
```
