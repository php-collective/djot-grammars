/**
 * ProseMirror JSON -> Djot serialization tests.
 *
 * Focused on block nesting: a container's block children must serialize with
 * the blank-line separators and content-column indentation djot needs, so the
 * document round-trips (re-parsing the output reproduces the same block tree).
 *
 * These assert the exact serialized string. A companion structural check runs
 * only when `@djot/djot` happens to be installed (it is not a dependency of
 * this package); it re-parses each output and confirms the container keeps the
 * expected block children, catching a case where a string looks right but djot
 * folds it.
 */
import { serializeToDjot } from '../tiptap/serializer.js';

const P = (t) => ({ type: 'paragraph', content: [{ type: 'text', text: t }] });
const CB = (t, lang = '') => ({ type: 'codeBlock', attrs: { language: lang }, content: [{ type: 'text', text: t }] });
const LI = (...content) => ({ type: 'listItem', content });
const UL = (...items) => ({ type: 'bulletList', content: items });
const OL = (...items) => ({ type: 'orderedList', content: items });
const BQ = (...content) => ({ type: 'blockquote', content });
const DIV = (cls, ...content) => ({ type: 'djotDiv', attrs: { class: cls }, content });
const doc = (...content) => ({ type: 'doc', content });

let pass = 0;
let fail = 0;

function check(name, node, expected, container = null, expectedChildren = null) {
    const got = serializeToDjot(node);
    if (got === expected) {
        pass++;
        console.log(`  ✓ ${name}`);
    } else {
        fail++;
        console.log(`  ✗ ${name}`);
        console.log(`    expected: ${JSON.stringify(expected)}`);
        console.log(`    got:      ${JSON.stringify(got)}`);
    }
    if (djotParse && container) {
        const ast = djotParse(got);
        const found = findTag(ast, container);
        const kids = found ? (found.children || []).map((c) => c.tag) : null;
        if (JSON.stringify(kids) !== JSON.stringify(expectedChildren)) {
            fail++;
            console.log(`  ✗ ${name} (re-parse structure)`);
            console.log(`    expected ${container} children: ${JSON.stringify(expectedChildren)}`);
            console.log(`    got:      ${JSON.stringify(kids)}`);
        } else {
            pass++;
            console.log(`  ✓ ${name} (re-parse structure)`);
        }
    }
}

function findTag(node, tag) {
    let hit = null;
    (function walk(n) {
        if (hit) return;
        if (n.tag === tag) { hit = n; return; }
        (n.children || []).forEach(walk);
    })(node);
    return hit;
}

// Structural verification is opt-in: only run when @djot/djot is installed.
let djotParse = null;
try {
    ({ parse: djotParse } = await import('@djot/djot'));
} catch {
    console.log('  (structural re-parse skipped: @djot/djot not installed)');
}

// --- list items: every block child must stay in the item -----------------
// Regression: a list item child that was neither a paragraph nor a nested
// list used to be dropped, and a second paragraph landed at column 0,
// dedenting out of the list (php-collective/djot-grammars#14).

check('loose list item: two paragraphs',
    doc(UL(LI(P('a'), P('b')))),
    '- a\n\n  b',
    'list_item', ['para', 'para']);

check('list item: paragraph then code block',
    doc(UL(LI(P('a'), CB('x=1', 'js')))),
    '- a\n\n  ``` js\n  x=1\n  ```',
    'list_item', ['para', 'code_block']);

check('list item: paragraph then block quote',
    doc(UL(LI(P('a'), BQ(P('b'))))),
    '- a\n\n  > b',
    'list_item', ['para', 'block_quote']);

check('list item: paragraph then nested sublist',
    doc(UL(LI(P('parent'), UL(LI(P('child')))))),
    '- parent\n\n  - child',
    'list_item', ['para', 'bullet_list']);

check('ordered list item: paragraph then nested sublist',
    doc(OL(LI(P('parent'), OL(LI(P('child')))))),
    '1. parent\n\n  1. child',
    'list_item', ['para', 'ordered_list']);

// --- block quotes: multiple children keep the >-blank separator ----------

check('block quote: two paragraphs',
    doc(BQ(P('a'), P('b'))),
    '> a\n>\n> b',
    'block_quote', ['para', 'para']);

check('block quote: paragraph then code block',
    doc(BQ(P('a'), CB('x=1'))),
    '> a\n>\n> ```\n> x=1\n> ```',
    'block_quote', ['para', 'code_block']);

// --- divs: multiple children keep the blank separator --------------------

check('div: two paragraphs',
    doc(DIV('tip', P('a'), P('b'))),
    '::: tip\na\n\nb\n:::',
    'div', ['para', 'para']);

check('div: paragraph then list',
    doc(DIV('note', P('a'), UL(LI(P('b'))))),
    '::: note\na\n\n- b\n:::',
    'div', ['para', 'bullet_list']);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
    process.exit(1);
}
