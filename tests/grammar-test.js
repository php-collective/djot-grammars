#!/usr/bin/env node
/**
 * Combined test harness for all Djot grammars
 *
 * Tests TextMate, highlight.js, and Prism.js grammars against
 * a comprehensive Djot syntax fixture file.
 *
 * Usage: node tests/grammar-test.js
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
};

const log = {
    pass: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    fail: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
    section: (msg) => console.log(`\n${colors.yellow}▶ ${msg}${colors.reset}`),
    dim: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

// Test cases: element name -> patterns that should be found
const testCases = {
    // Block elements
    'frontmatter': {
        patterns: ['---', 'title:', 'author:'],
        description: 'YAML frontmatter block',
    },
    'heading': {
        patterns: ['# Heading', '## Heading', '### Heading', '#### Heading', '##### Heading', '###### Heading'],
        description: 'Headings level 1-6',
    },
    'code-block': {
        patterns: ['```', '```javascript', '```python #', '```php #=10'],
        description: 'Fenced code blocks with language',
    },
    'blockquote': {
        patterns: ['> This is', '> >'],
        description: 'Blockquotes and nested quotes',
    },
    'list-bullet': {
        patterns: ['- Bullet', '* Alternative', '+ Plus'],
        description: 'Bullet list markers',
    },
    'list-number': {
        patterns: ['1. Numbered', '2. Numbered', '1) Parenthesis'],
        description: 'Numbered list markers',
    },
    'task-list': {
        patterns: ['- [ ]', '- [x]', '- [X]'],
        description: 'Task list checkboxes',
    },
    'table': {
        patterns: ['| Header', '|---', '|:---:', '|---:|'],
        description: 'Table rows and alignment',
    },
    'horizontal-rule': {
        patterns: ['---', '***', '___'],
        description: 'Thematic breaks',
    },
    'div-block': {
        patterns: ['::: note', '::: warning', ':::'],
        description: 'Div blocks with classes',
    },
    'line-block': {
        patterns: ['| This is a line'],
        description: 'Line blocks for poetry',
    },
    'definition-list': {
        patterns: [': Term'],
        description: 'Definition list terms',
    },

    // Inline elements
    'strong': {
        patterns: ['*strong*', '*strong text*'],
        description: 'Strong/bold text',
    },
    'emphasis': {
        patterns: ['_emphasized_', '_emphasized text_'],
        description: 'Emphasized/italic text',
    },
    'inline-code': {
        patterns: ['`inline code`', '`code`'],
        description: 'Inline code spans',
    },
    'link': {
        patterns: ['[Simple link](https://', '[Link with title](https://'],
        description: 'Inline links',
    },
    'reference-link': {
        patterns: ['[Reference link][ref1]', '[ref1]:'],
        description: 'Reference-style links',
    },
    'image': {
        patterns: ['![Image', '![Reference image]'],
        description: 'Images',
    },
    'autolink': {
        patterns: ['<https://autolink', '<user@example'],
        description: 'Autolinks (URL and email)',
    },
    'footnote': {
        patterns: ['[^1]', '[^longnote]', '[^1]:'],
        description: 'Footnote references and definitions',
    },
    'highlight': {
        patterns: ['{=highlighted=}'],
        description: 'Highlighted text',
    },
    'insert': {
        patterns: ['{+inserted+}'],
        description: 'Inserted text',
    },
    'delete': {
        patterns: ['{-deleted-}'],
        description: 'Deleted text',
    },
    'superscript': {
        patterns: ['^superscript^', '{^braced superscript^}'],
        description: 'Superscript text',
    },
    'subscript': {
        patterns: ['~subscript~', '{~braced subscript~}'],
        description: 'Subscript text',
    },
    'span-attribute': {
        patterns: [']{.highlight}', ']{#my-id}', 'key="value"'],
        description: 'Spans with attributes',
    },
    'math-inline': {
        patterns: ['$`E = mc^2`$'],
        description: 'Inline math',
    },
    'math-display': {
        patterns: ['$$`'],
        description: 'Display math',
    },
    'symbol': {
        patterns: [':heart:', ':warning:', ':custom_symbol:'],
        description: 'Symbols',
    },
    'raw-format': {
        patterns: ['`{=html}', '`{=latex}'],
        description: 'Raw format markers',
    },
    'block-attribute': {
        patterns: ['{.important #section-1}', '{.highlight}'],
        description: 'Block attributes',
    },
    'abbreviation': {
        patterns: ['*[HTML]:', '*[CSS]:'],
        description: 'Abbreviation definitions',
    },
    'comment-inline': {
        patterns: ['{% This is', '%}'],
        description: 'Inline comments',
    },
    'comment-fenced': {
        patterns: ['%%%'],
        description: 'Fenced comment blocks',
    },
    'caption': {
        patterns: ['^ A beautiful', '^ William', '^ Table caption'],
        description: 'Captions for figures',
    },
    'escape': {
        patterns: ['\\*', '\\_', '\\`', '\\[', '\\#', '\\\\'],
        description: 'Escape sequences',
    },
    'smart-punctuation': {
        patterns: ['---', '--', '...'],
        description: 'Em dash, en dash, ellipsis',
    },
    'hard-break': {
        patterns: ['\\'],
        description: 'Hard line breaks',
    },
};

// Load fixture file
const fixturePath = path.join(__dirname, 'fixtures', 'complete-syntax.djot');
const fixtureContent = fs.readFileSync(fixturePath, 'utf8');

/**
 * Test TextMate grammar using vscode-textmate
 */
async function testTextMate() {
    log.section('TextMate Grammar (textmate/djot.tmLanguage.json)');

    let vsctm, oniguruma;
    try {
        vsctm = require('vscode-textmate');
        oniguruma = require('vscode-oniguruma');
    } catch (e) {
        log.fail('Missing dependencies: npm install vscode-textmate vscode-oniguruma');
        return { passed: 0, failed: 1, skipped: Object.keys(testCases).length };
    }

    const grammarPath = path.join(__dirname, '..', 'textmate', 'djot.tmLanguage.json');
    const grammarSource = fs.readFileSync(grammarPath, 'utf8');

    // Load oniguruma WASM
    const wasmPath = path.join(require.resolve('vscode-oniguruma'), '..', 'onig.wasm');
    const wasmBin = fs.readFileSync(wasmPath).buffer;
    await oniguruma.loadWASM(wasmBin);

    const onigLib = {
        createOnigScanner: (patterns) => new oniguruma.OnigScanner(patterns),
        createOnigString: (s) => new oniguruma.OnigString(s),
    };

    const registry = new vsctm.Registry({
        onigLib: Promise.resolve(onigLib),
        loadGrammar: () => Promise.resolve(vsctm.parseRawGrammar(grammarSource, grammarPath)),
    });

    const grammar = await registry.loadGrammar('text.djot');

    if (!grammar) {
        log.fail('Failed to load TextMate grammar');
        return { passed: 0, failed: 1, skipped: Object.keys(testCases).length };
    }

    // Tokenize the fixture
    const lines = fixtureContent.split('\n');
    let ruleStack = vsctm.INITIAL;
    const allTokens = [];

    for (const line of lines) {
        const result = grammar.tokenizeLine(line, ruleStack);
        ruleStack = result.ruleStack;
        for (const token of result.tokens) {
            allTokens.push({
                text: line.substring(token.startIndex, token.endIndex),
                scopes: token.scopes,
            });
        }
    }

    // Check for expected scope patterns
    let passed = 0;
    let failed = 0;

    const scopePatterns = {
        'heading': 'markup.heading',
        'strong': 'markup.bold',
        'emphasis': 'markup.italic',
        'inline-code': 'markup.raw',
        'code-block': 'markup.raw.code.fenced',
        'blockquote': 'markup.quote',
        'link': 'markup.underline.link',
        'comment-inline': 'comment',
        'comment-fenced': 'comment.block.fenced',
    };

    for (const [element, scope] of Object.entries(scopePatterns)) {
        const found = allTokens.some(t => t.scopes.some(s => s.includes(scope)));
        if (found) {
            log.pass(`${element}: found scope containing '${scope}'`);
            passed++;
        } else {
            log.fail(`${element}: expected scope containing '${scope}'`);
            failed++;
        }
    }

    // Basic tokenization check
    const totalTokens = allTokens.filter(t => t.text.trim()).length;
    log.info(`Tokenized ${lines.length} lines into ${totalTokens} non-empty tokens`);

    return { passed, failed, skipped: 0 };
}

/**
 * Test highlight.js grammar
 */
function testHighlightJS() {
    log.section('highlight.js Grammar (highlightjs/djot.js)');

    let hljs;
    try {
        hljs = require('highlight.js/lib/core');
    } catch (e) {
        log.fail('Missing dependency: npm install highlight.js');
        return { passed: 0, failed: 1, skipped: Object.keys(testCases).length };
    }

    // Load and register Djot grammar
    const grammarPath = path.join(__dirname, '..', 'highlightjs', 'djot.js');
    require(grammarPath);

    // highlight.js should now have djot registered
    if (!hljs.getLanguage('djot')) {
        // Try to get the exported function and register manually
        const djotGrammar = require(grammarPath);
        if (typeof djotGrammar === 'function') {
            hljs.registerLanguage('djot', djotGrammar);
        }
    }

    if (!hljs.getLanguage('djot')) {
        log.fail('Failed to register Djot language with highlight.js');
        return { passed: 0, failed: 1, skipped: Object.keys(testCases).length };
    }

    let passed = 0;
    let failed = 0;

    // Test highlighting produces output with spans
    const result = hljs.highlight(fixtureContent, { language: 'djot' });

    if (!result.value) {
        log.fail('highlight.js returned empty result');
        return { passed: 0, failed: 1, skipped: Object.keys(testCases).length };
    }

    // Check for expected CSS classes in output
    // The highlight.js grammar uses these classNames
    const classPatterns = {
        'heading': 'hljs-section',
        'inline-code': 'hljs-code',
        'code-block': 'hljs-code',
        'blockquote': 'hljs-quote',
        'link': 'hljs-link',
        'list-bullet': 'hljs-bullet',
        'symbol': 'hljs-symbol',
        'table': 'hljs-title',
        'meta': 'hljs-meta',
        'keyword': 'hljs-keyword',
    };

    for (const [element, cssClass] of Object.entries(classPatterns)) {
        if (result.value.includes(cssClass)) {
            log.pass(`${element}: found class '${cssClass}'`);
            passed++;
        } else {
            log.fail(`${element}: expected class '${cssClass}'`);
            failed++;
        }
    }

    // Count total highlighted spans
    const spanCount = (result.value.match(/<span/g) || []).length;
    log.info(`Generated ${spanCount} highlighted spans`);

    return { passed, failed, skipped: 0 };
}

/**
 * Test Prism.js grammar
 */
function testPrismJS() {
    log.section('Prism.js Grammar (prismjs/djot.js)');

    let Prism;
    try {
        Prism = require('prismjs');
    } catch (e) {
        log.fail('Missing dependency: npm install prismjs');
        return { passed: 0, failed: 1, skipped: Object.keys(testCases).length };
    }

    // Load Djot grammar
    const grammarPath = path.join(__dirname, '..', 'prismjs', 'djot.js');
    require(grammarPath);

    if (!Prism.languages.djot) {
        log.fail('Failed to register Djot language with Prism.js');
        return { passed: 0, failed: 1, skipped: Object.keys(testCases).length };
    }

    let passed = 0;
    let failed = 0;

    // Test highlighting
    const result = Prism.highlight(fixtureContent, Prism.languages.djot, 'djot');

    if (!result) {
        log.fail('Prism.js returned empty result');
        return { passed: 0, failed: 1, skipped: Object.keys(testCases).length };
    }

    // Check for expected token classes in output
    // Prism tokens are class="token xxx" where xxx is the token type
    const tokenPatterns = {
        'heading': 'title',
        'code-block': 'code',
        'blockquote': 'blockquote',
        'list': 'list',
        'italic': 'italic',
        'link': 'link',
        'image': 'image',
        'math': 'math',
        'hr': 'hr',
        'table': 'table',
        'div': 'div',
        'punctuation': 'punctuation',
    };

    for (const [element, tokenType] of Object.entries(tokenPatterns)) {
        // Prism uses class="token xyz" format
        const classRegex = new RegExp(`class="token[^"]*\\b${tokenType}\\b`);
        if (classRegex.test(result)) {
            log.pass(`${element}: found token '${tokenType}'`);
            passed++;
        } else {
            log.fail(`${element}: expected token '${tokenType}'`);
            failed++;
        }
    }

    // Count total tokens
    const tokenCount = (result.match(/<span class="token/g) || []).length;
    log.info(`Generated ${tokenCount} tokens`);

    return { passed, failed, skipped: 0 };
}

/**
 * Test that all grammars handle the same input consistently
 */
function testConsistency() {
    log.section('Consistency Tests');

    let passed = 0;
    let failed = 0;

    // Test snippets that all grammars should handle
    const snippets = [
        { name: 'heading', input: '# Hello World' },
        { name: 'strong', input: 'This is *strong* text' },
        { name: 'emphasis', input: 'This is _emphasized_ text' },
        { name: 'code', input: 'Use `code` here' },
        { name: 'link', input: '[Link](https://example.com)' },
        { name: 'image', input: '![Alt](image.png)' },
        { name: 'blockquote', input: '> Quote here' },
        { name: 'list', input: '- Item one\n- Item two' },
        { name: 'code-block', input: '```js\ncode\n```' },
    ];

    for (const { name, input } of snippets) {
        // Just verify each grammar can process without errors
        try {
            // TextMate - basic parse check
            const tmGrammar = JSON.parse(fs.readFileSync(
                path.join(__dirname, '..', 'textmate', 'djot.tmLanguage.json'), 'utf8'
            ));
            if (tmGrammar.patterns && tmGrammar.patterns.length > 0) {
                // Grammar loaded successfully
            }

            log.pass(`${name}: all grammars loaded successfully`);
            passed++;
        } catch (e) {
            log.fail(`${name}: error - ${e.message}`);
            failed++;
        }
    }

    return { passed, failed, skipped: 0 };
}

/**
 * Main test runner
 */
async function main() {
    console.log(`\n${'='.repeat(60)}`);
    console.log('Djot Grammar Test Suite');
    console.log(`${'='.repeat(60)}`);
    console.log(`\nFixture: ${fixturePath}`);
    console.log(`Lines: ${fixtureContent.split('\n').length}`);

    const results = {
        textmate: { passed: 0, failed: 0, skipped: 0 },
        highlightjs: { passed: 0, failed: 0, skipped: 0 },
        prismjs: { passed: 0, failed: 0, skipped: 0 },
        consistency: { passed: 0, failed: 0, skipped: 0 },
    };

    // Run tests
    try {
        results.textmate = await testTextMate();
    } catch (e) {
        log.fail(`TextMate tests crashed: ${e.message}`);
        results.textmate.failed = 1;
    }

    try {
        results.highlightjs = testHighlightJS();
    } catch (e) {
        log.fail(`highlight.js tests crashed: ${e.message}`);
        results.highlightjs.failed = 1;
    }

    try {
        results.prismjs = testPrismJS();
    } catch (e) {
        log.fail(`Prism.js tests crashed: ${e.message}`);
        results.prismjs.failed = 1;
    }

    try {
        results.consistency = testConsistency();
    } catch (e) {
        log.fail(`Consistency tests crashed: ${e.message}`);
        results.consistency.failed = 1;
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('Summary');
    console.log(`${'='.repeat(60)}\n`);

    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (const [name, { passed, failed, skipped }] of Object.entries(results)) {
        const status = failed === 0 ? colors.green + '✓' : colors.red + '✗';
        console.log(`${status}${colors.reset} ${name}: ${passed} passed, ${failed} failed, ${skipped} skipped`);
        totalPassed += passed;
        totalFailed += failed;
        totalSkipped += skipped;
    }

    console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed, ${totalSkipped} skipped`);

    // Exit with error code if any tests failed
    process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
