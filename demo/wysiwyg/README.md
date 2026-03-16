# WYSIWYG Editor Demos

True WYSIWYG editors that serialize to Djot markup. Unlike source editors (CodeMirror, Monaco) where you edit markup code, these editors let you edit formatted text directly.

## Demos

### Tiptap (Recommended)

**Location:** `tiptap/index.html`

The most complete implementation with all Djot features:

- All inline marks: strong `*`, emphasis `_`, code, highlight `{= =}`, delete `{- -}`, insert `{+ +}`, superscript `^`, subscript `~`
- Block elements: headings, blockquotes, code blocks with language, div containers `:::`
- Lists: bullet, ordered, task lists
- Tables with add/remove rows/columns
- Images with alt text
- Link editing with popover UI
- Full toolbar with active state indicators

### Milkdown

**Location:** `milkdown/index.html`

Plugin-driven editor built on ProseMirror with native Markdown support:

- Standard formatting (strong, emphasis, code, strikethrough)
- GFM tables
- Working toolbar with all common commands
- Markdown to Djot conversion

### ProseMirror

**Location:** `prosemirror/index.html`

Direct ProseMirror implementation for educational purposes:

- Custom Djot schema
- Basic Djot marks support
- Shows low-level ProseMirror architecture

## Running the Demos

Serve the files with any HTTP server:

```bash
cd demo/wysiwyg

# Python
python3 -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

Open http://localhost:8080 to see the demo index.

## Feature Comparison

| Feature | Tiptap | Milkdown | ProseMirror |
|---------|--------|----------|-------------|
| Learning Curve | Easy | Easy | Steep |
| Highlight `{=text=}` | ✓ | — | ✓ |
| Insert `{+text+}` | ✓ | — | ✓ |
| Delete `{-text-}` | ✓ | ✓ (via ~~) | ✓ |
| Super/Subscript | ✓ | — | ✓ |
| Tables | ✓ | ✓ GFM | — |
| Task Lists | ✓ | — | — |
| Images | ✓ | — | — |
| Div Containers | ✓ | — | — |
| Link Editing | ✓ Popover | Basic | Basic |
| Code Block Language | ✓ | ✓ | ✓ |

## Code Block Language Syntax

In Djot, code blocks use a space between the fence and language:

```
``` php
<?php
echo "Hello";
```
```

This differs from Markdown which has no space. The Tiptap demo includes a language dropdown that properly formats this.

## Architecture

All demos follow the same pattern:

```
User edits rich text
    ↓
ProseMirror document model
    ↓
Custom serializer
    ↓
Djot text output
```

The serializers handle:
- Proper mark nesting
- Code block language with Djot space syntax
- Task list checkbox state
- Table header row detection
- Div container classes

## Dependencies

All loaded via CDN (esm.sh):

- Tiptap: `@tiptap/core`, `@tiptap/starter-kit`, various extensions
- Milkdown: `@milkdown/core`, `@milkdown/preset-commonmark`, `@milkdown/preset-gfm`
- ProseMirror: `prosemirror-*` packages
- All: `@djot/djot` for HTML preview
