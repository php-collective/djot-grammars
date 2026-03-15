# Djot Grammars

Syntax highlighting grammars for the [Djot](https://djot.net) markup language.

## Included Grammars

### TextMate Grammar

**Location:** `textmate/djot.tmLanguage.json`

Works with:
- [Shiki](https://shiki.style/) (VitePress, Astro, etc.)
- [Phiki](https://github.com/phikiphp/phiki) (PHP, Torchlight Engine)
- VS Code (via TextMate support)
- TextMate and compatible editors
- IntelliJ/PhpStorm (via [Djot plugin](https://plugins.jetbrains.com/plugin/18828-djot))

#### Usage with Shiki (Node.js)

```js
import { createHighlighter } from 'shiki'
import djotGrammar from 'djot-grammars/textmate/djot.tmLanguage.json'

const highlighter = await createHighlighter({
  themes: ['github-light'],
  langs: [djotGrammar],
})

const html = highlighter.codeToHtml(code, { lang: 'djot', theme: 'github-light' })
```

#### Usage with VitePress

```ts
// .vitepress/config.ts
import { defineConfig } from 'vitepress'
import djotGrammar from 'djot-grammars/textmate/djot.tmLanguage.json'

export default defineConfig({
  markdown: {
    languages: [
      { ...djotGrammar, name: 'djot', aliases: ['dj'] },
    ],
  },
})
```

#### Usage with Phiki (PHP)

```php
use Phiki\Phiki;
use Phiki\Environment\Environment;

$grammarPath = __DIR__ . '/vendor/php-collective/djot-grammars/textmate/djot.tmLanguage.json';

$environment = Environment::default();
$environment->getGrammarRepository()->register('djot', $grammarPath);

$phiki = new Phiki($environment);
$html = $phiki->codeToHtml($djotCode, 'djot', 'github-light');
```

---

### highlight.js Grammar

**Location:** `highlightjs/djot.js`

Works with [highlight.js](https://highlightjs.org/) for client-side syntax highlighting.

#### Usage

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="path/to/djot-grammars/highlightjs/djot.js"></script>
<script>hljs.highlightAll();</script>
```

```html
<pre><code class="language-djot">
# Hello World

This is *strong* and _emphasized_ text.
</code></pre>
```

---

### Prism.js Grammar

**Location:** `prismjs/djot.js`

Works with [Prism.js](https://prismjs.com/) for client-side syntax highlighting.

#### Usage

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="path/to/djot-grammars/prismjs/djot.js"></script>
```

```html
<pre><code class="language-djot">
# Hello World

This is *strong* and _emphasized_ text.
</code></pre>
```

---

## External Grammars

These Djot grammars are maintained in other repositories:

| Grammar | Repository | Description |
|---------|------------|-------------|
| **tree-sitter** | [treeman/tree-sitter-djot](https://github.com/treeman/tree-sitter-djot) | For Neovim, Helix, and other tree-sitter editors |
| **Vim** | [jgm/djot](https://github.com/jgm/djot/tree/main/editors/vim) | Official Vim syntax file |
| **Emacs** | [jgm/djot](https://github.com/jgm/djot/tree/main/editors/emacs) | Official Emacs major mode |
| **Sublime Text** | [sorairolake/djot.sublime-syntax](https://github.com/sorairolake/djot.sublime-syntax) | Sublime Text syntax (archived) |

---

## Supported Syntax

All grammars support the full [Djot specification](https://htmlpreview.github.io/?https://github.com/jgm/djot/blob/master/doc/syntax.html) plus [djot-php](https://github.com/php-collective/djot-php) enhancements:

### Block Elements
- Headings (`# Title` through `###### Title`)
- Code fences (` ``` ` with optional language)
- Div blocks (`:::` with optional class)
- Blockquotes (`> text`)
- Lists (bullets `-`, `*`, `+` and numbered `1.`, `1)`)
- Task lists (`- [ ]`, `- [x]`)
- Definition lists (`: term`)
- Tables (`| cell | cell |` with separator rows)
- Line blocks (`| text` for poetry/addresses)
- Horizontal rules (`---`, `***`, `___`)
- Block attributes (`{.class #id key=value}`)

### Inline Elements
- Strong (`*bold*`)
- Emphasis (`_italic_`)
- Highlight (`{=text=}`)
- Insert (`{+text+}`)
- Delete (`{-text-}`)
- Superscript (`^text^`, `{^text^}`)
- Subscript (`~text~`, `{~text~}`)
- Inline code (`` `code` ``)
- Links (`[text](url)`, `[text][ref]`)
- Images (`![alt](url)`)
- Autolinks (`<https://...>`, `<user@example.com>`)
- Footnotes (`[^note]` and `[^note]: definition`)
- Math (`$` `` `code` `` `$` and `$$` `` `code` `` `$$`)
- Symbols (`:name:`)
- Spans with attributes (`[text]{.class}`)
- Raw format markers (`` `code`{=html} ``)
- Escape sequences (`\*`, `\[`, etc.)
- Hard line breaks (`\` at end of line)
- Smart punctuation (`---`, `--`, `...`)

### djot-php Extensions
- Captions (`^ caption text` for images, tables, blockquotes)
- Fenced comments (`%%%` blocks)
- Inline comments (`{% comment %}`)
- Table row/cell attributes (`| cell |{.class}`)

---

## Installation

### NPM

```bash
npm install djot-grammars
```

### Composer (PHP)

```bash
composer require php-collective/djot-grammars
```

### Manual

Download the grammar files directly from this repository.

---

## Comparison

| Feature | TextMate | highlight.js | Prism.js | tree-sitter |
|---------|----------|--------------|----------|-------------|
| Rendering | Server/Client | Client | Client | Server/Editor |
| JS required | Depends | Yes | Yes | No |
| Used by | Shiki, VS Code, Phiki | highlight.js | Prism.js | Neovim, Helix |
| Themes | VS Code themes | 90+ | 8+ | Editor themes |
| Extensible | Limited | Some | Extensive | Yes |

---

## Contributing

Contributions are welcome! Please ensure any changes maintain compatibility with the [Djot specification](https://djot.net).

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related Projects

- [Djot](https://djot.net) - The Djot markup language
- [djot-php](https://github.com/php-collective/djot-php) - PHP implementation
- [djot.js](https://github.com/jgm/djot.js) - JavaScript implementation
- [djot-intellij](https://github.com/php-collective/djot-intellij) - IntelliJ/PhpStorm plugin
