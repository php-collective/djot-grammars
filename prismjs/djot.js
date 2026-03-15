/**
 * Djot language definition for Prism.js
 *
 * Supports the full Djot specification plus djot-php enhancements.
 * @see https://djot.net for Djot specification
 * @see https://github.com/php-collective/djot-php for enhancements
 */
(function (Prism) {
    Prism.languages.djot = {
        // Frontmatter: YAML metadata at document start
        'front-matter-block': {
            pattern: /^---[\s\S]*?^---$/m,
            greedy: true,
            inside: {
                'punctuation': /^---|---$/,
                'front-matter': {
                    pattern: /[\s\S]+/,
                    alias: 'yaml',
                },
            },
        },

        // Fenced comments: %%% ... %%%
        'comment': [
            {
                pattern: /^%%%[\s\S]*?^%%%$/m,
                greedy: true,
            },
            // Inline comments: {% ... %}
            {
                pattern: /\{%[\s\S]*?%\}/,
                greedy: true,
            },
        ],

        // Code blocks: ``` lang ... ```
        'code': {
            pattern: /^(`{3,})[^\n]*\n[\s\S]*?^\1$/m,
            greedy: true,
            inside: {
                'code-block': {
                    pattern: /^(`{3,})(.*)$/m,
                    inside: {
                        'punctuation': /^`{3,}/,
                        'language': /.+/,
                    },
                },
                'code-content': {
                    pattern: /[\s\S]+/,
                },
            },
        },

        // Headings: # to ######
        'title': {
            pattern: /^#{1,6}\s.+$/m,
            inside: {
                'punctuation': /^#{1,6}/,
                'important': /.+/,
            },
        },

        // Horizontal rules: ---, ***, ___
        'hr': {
            pattern: /^(?:[-*_]){3,}$/m,
            alias: 'punctuation',
        },

        // Blockquotes: > text
        'blockquote': {
            pattern: /^>.*$/m,
            inside: {
                'punctuation': /^>/,
            },
        },

        // Div blocks: ::: class
        'div': {
            pattern: /^:::.*$/m,
            inside: {
                'punctuation': /^:::/,
                'class-name': /.+/,
            },
        },

        // Tables
        'table': {
            pattern: /^\|.+\|$/m,
            inside: {
                'punctuation': /\|/,
                'table-header': {
                    pattern: /^[-:|]+$/,
                },
            },
        },

        // Task lists: - [ ] or - [x]
        'task-list': {
            pattern: /^[-*+]\s+\[[ xX]\]/m,
            inside: {
                'punctuation': /[-*+]/,
                'checkbox': {
                    pattern: /\[[ xX]\]/,
                    inside: {
                        'checked': /\[[xX]\]/,
                        'unchecked': /\[ \]/,
                    },
                },
            },
        },

        // List items: -, *, +, or 1., 1)
        'list': {
            pattern: /^(?:[-*+]|\d+[.)])\s/m,
            alias: 'punctuation',
        },

        // Definition terms: : term
        'definition': {
            pattern: /^:\s.+$/m,
            inside: {
                'punctuation': /^:/,
                'term': /.+/,
            },
        },

        // Line blocks: | text
        'line-block': {
            pattern: /^\|\s.*$/m,
            inside: {
                'punctuation': /^\|/,
            },
        },

        // Captions: ^ caption text
        'caption': {
            pattern: /^\^\s.+$/m,
            alias: 'italic',
        },

        // Footnote definitions: [^note]: text
        'footnote-definition': {
            pattern: /^\[\^[^\]]+\]:/m,
            inside: {
                'punctuation': /[\[\]^:]/,
                'footnote-name': /[^\[\]^:]+/,
            },
        },

        // Reference definitions: [ref]: url
        'reference-definition': {
            pattern: /^\[[^\]]+\]:\s*.+$/m,
            inside: {
                'punctuation': /[\[\]:]/,
                'reference-name': /[^\[\]:]+(?=\]:)/,
                'url': /\S+$/,
            },
        },

        // Abbreviation definitions: *[ABBR]: full text
        'abbreviation-definition': {
            pattern: /^\*\[[^\]]+\]:/m,
            inside: {
                'punctuation': /[*\[\]:]/,
                'abbreviation': /[^\[\]:]+/,
            },
        },

        // Display math: $$`...`$$ or $$`...`
        'math-display': {
            pattern: /\$\$`[^`]*`(?:\$\$)?/,
            greedy: true,
            alias: 'equation',
            inside: {
                'punctuation': /\$\$`|`\$\$|`/,
                'math-content': /[^`]+/,
            },
        },

        // Inline math: $`...`$
        'math-inline': {
            pattern: /\$`[^`]*`\$/,
            greedy: true,
            alias: 'equation',
            inside: {
                'punctuation': /\$`|`\$/,
                'math-content': /[^`]+/,
            },
        },

        // Images: ![alt](url) or ![alt][ref]
        'image': {
            pattern: /!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])/,
            greedy: true,
            inside: {
                'punctuation': /[!\[\]()]/,
                'alt': {
                    pattern: /(?<=!\[)[^\]]*/,
                },
                'url': {
                    pattern: /(?<=\()[^)]*/,
                    alias: 'string',
                },
                'reference': {
                    pattern: /(?<=\])\[[^\]]*/,
                },
            },
        },

        // Links: [text](url) or [text][ref]
        'link': {
            pattern: /\[[^\]]+\](?:\([^)]*\)|\[[^\]]*\])/,
            greedy: true,
            inside: {
                'punctuation': /[\[\]()]/,
                'link-text': {
                    pattern: /(?<=\[)[^\]]*/,
                },
                'url': {
                    pattern: /(?<=\()[^)]*/,
                    alias: 'string',
                },
                'reference': {
                    pattern: /(?<=\])\[[^\]]*/,
                },
            },
        },

        // Autolinks: <https://...> or <user@example.com>
        'autolink': {
            pattern: /<(?:https?:\/\/[^>]+|[^@>\s]+@[^>]+)>/,
            greedy: true,
            alias: 'url',
            inside: {
                'punctuation': /[<>]/,
            },
        },

        // Footnote references: [^note]
        'footnote-reference': {
            pattern: /\[\^[^\]]+\]/,
            inside: {
                'punctuation': /[\[\]^]/,
                'footnote-name': /[^\[\]^]+/,
            },
        },

        // Spans with attributes: [text]{.class}
        'span': {
            pattern: /\[[^\]]+\]\{[^}]+\}/,
            greedy: true,
            inside: {
                'punctuation': /[\[\]{}]/,
                'span-text': {
                    pattern: /(?<=\[)[^\]]*/,
                },
                'attr': {
                    pattern: /(?<=\{)[^}]*/,
                },
            },
        },

        // Raw format: `code`{=html}
        'raw': {
            pattern: /`[^`]+`\{=[a-z]+\}/,
            greedy: true,
            inside: {
                'code': {
                    pattern: /`[^`]+`/,
                },
                'format': {
                    pattern: /\{=[a-z]+\}/,
                    inside: {
                        'punctuation': /[{}=]/,
                        'language': /[a-z]+/,
                    },
                },
            },
        },

        // Highlight: {=text=}
        'highlight': {
            pattern: /\{=[^=}]+(?:=[^}]*)?\}/,
            greedy: true,
            alias: 'important',
            inside: {
                'punctuation': /\{=|=\}/,
            },
        },

        // Insert: {+text+}
        'inserted': {
            pattern: /\{\+[^+}]+\+\}/,
            greedy: true,
            inside: {
                'punctuation': /\{\+|\+\}/,
            },
        },

        // Delete: {-text-}
        'deleted': {
            pattern: /\{-[^-}]+-\}/,
            greedy: true,
            inside: {
                'punctuation': /\{-|-\}/,
            },
        },

        // Superscript: ^text^ or {^text^}
        'superscript': {
            pattern: /(?:\{\^[^^}]+\^\}|\^[^^]+\^)/,
            greedy: true,
            inside: {
                'punctuation': /[\^{}]/,
            },
        },

        // Subscript: ~text~ or {~text~}
        'subscript': {
            pattern: /(?:\{~[^~}]+~\}|~[^~]+~)/,
            greedy: true,
            inside: {
                'punctuation': /[~{}]/,
            },
        },

        // Strong: *text*
        'bold': {
            pattern: /(?<!\w)\*(?!\s)[^*]*[^*\s]\*(?!\w)/,
            greedy: true,
            inside: {
                'punctuation': /^\*|\*$/,
            },
        },

        // Emphasis: _text_
        'italic': {
            pattern: /(?<!\w)_(?!\s)[^_]*[^_\s]_(?!\w)/,
            greedy: true,
            inside: {
                'punctuation': /^_|_$/,
            },
        },

        // Inline code: `code`
        'code-inline': {
            pattern: /`[^`]+`/,
            greedy: true,
            alias: 'code',
        },

        // Symbols: :name:
        'symbol': {
            pattern: /:[a-zA-Z_][a-zA-Z0-9_-]*:/,
            greedy: true,
        },

        // Block attributes: {.class #id key=value}
        'attr': {
            pattern: /\{(?![=+\-%])[^}]+\}/,
        },

        // Smart punctuation
        'punctuation': [
            /---/,  // em dash
            /--/,   // en dash
            /\.\.\./,  // ellipsis
        ],

        // Escaped characters: \* \[ etc
        'escape': {
            pattern: /\\[!"#$%&'()*+,.\/:;<=>?@\[\\\]^_`{|}~-]/,
        },

        // Hard line break: \ at end of line
        'hard-break': {
            pattern: /\\$/m,
            alias: 'punctuation',
        },
    };

    // Aliases
    Prism.languages.dj = Prism.languages.djot;

}(Prism));
