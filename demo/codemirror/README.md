# CodeMirror 6 Djot Demo

A fully functional CodeMirror 6 editor with Djot syntax highlighting and live preview.

## Features

- **Syntax highlighting** for all Djot elements using CodeMirror's StreamLanguage
- **Live preview** powered by [djot.js](https://github.com/jgm/djot.js)
- **Dark theme** optimized for readability
- **Zero build step** - runs directly in browser via ES modules and CDN

## Running the Demo

Serve the file with any HTTP server:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

Then open <http://localhost:8080> in your browser.

## Supported Syntax

| Element | Djot Syntax |
|---------|-------------|
| Headings | `# ## ### ...` |
| Strong | `*text*` |
| Emphasis | `_text_` |
| Code | `` `code` `` |
| Code blocks | ` ``` ` or `~~~` |
| Links | `[text](url)` |
| Autolinks | `<https://...>` |
| Highlight | `{=text=}` |
| Delete | `{-text-}` |
| Insert | `{+text+}` |
| Superscript | `^text^` |
| Subscript | `~text~` |
| Math | `$...$` and `$$...$$` |
| Tables | `\| cell \| cell \|` |
| Blockquotes | `> text` |
| Lists | `- item` or `1. item` |
| Footnotes | `[^ref]` |
| Attributes | `{.class #id}` |
| Comments | `{% comment %}` |

## Architecture

This demo uses CodeMirror 6's `StreamLanguage` to implement syntax highlighting via a simple state machine parser. For production use, consider creating a full Lezer grammar for incremental parsing.

## Dependencies

All loaded via CDN (esm.sh):

- `@codemirror/state`
- `@codemirror/view`
- `@codemirror/language`
- `@codemirror/commands`
- `@codemirror/search`
- `@djot/djot`
