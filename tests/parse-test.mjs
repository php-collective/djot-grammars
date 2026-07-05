/**
 * HTML -> Djot round-trip tests.
 *
 * This harness mounts a real Tiptap editor (via happy-dom), seeds it with the
 * HTML that djot-php actually renders, and serializes back to Djot. That is
 * the path a WYSIWYG (e.g. wp-djot's visual editor) uses, and the only way to
 * catch parseHTML gaps.
 */
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < 20) {
    console.log('parse tests skipped: happy-dom requires Node >= 20');
    process.exit(0);
}

const { Window } = await import('happy-dom');

const win = new Window({ url: 'http://localhost/' });
globalThis.window = win;
globalThis.document = win.document;
for (const k of ['DOMParser', 'Node', 'Element', 'HTMLElement', 'navigator', 'getComputedStyle', 'MutationObserver']) {
    if (globalThis[k] === undefined && win[k] !== undefined) {
        try { globalThis[k] = win[k]; } catch { /* read-only global (e.g. navigator) - ignore */ }
    }
}

const { Editor } = await import('@tiptap/core');
const { DjotKit, serializeToDjot } = await import('../tiptap/index.js');

let pass = 0;
let fail = 0;

function check(name, html, expected) {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const editor = new Editor({ element: el, extensions: [DjotKit], content: html });
    const got = serializeToDjot(editor.getJSON()).trim();
    editor.destroy();
    el.remove();
    if (got === expected) {
        pass++;
        console.log(`  ✓ ${name}`);
    } else {
        fail++;
        console.log(`  ✗ ${name}`);
        console.log(`    expected: ${JSON.stringify(expected)}`);
        console.log(`    got:      ${JSON.stringify(got)}`);
    }
}

// --- ::: containers, as djot-php actually renders them ---

check('plain container round-trips without a title line',
    '<div class="note"><p>Body.</p></div>',
    '::: note\nBody.\n:::');

check('titled admonition keeps its title as an attribute line',
    '<div class="admonition warning" role="alert">\n'
    + '<p class="admonition-title">Watch Out!</p>\n<p>Body.</p>\n</div>',
    '{title="Watch Out!"}\n::: admonition warning\nBody.\n:::');

check('double quote in a title is backslash-escaped',
    '<div class="admonition warning" role="alert">'
    + '<p class="admonition-title">Say "hi"</p><p>Body.</p></div>',
    '{title="Say \\"hi\\""}\n::: admonition warning\nBody.\n:::');

check('explicitly empty title round-trips (suppresses the default title text)',
    '<div class="admonition note" role="note" data-djot-admonition-type="note" data-djot-admonition-title="">'
    + '<p class="admonition-title"></p><p>Body.</p></div>',
    '{title=""}\n::: admonition note\nBody.\n:::');

check('round-trip mode custom title is read from the data attribute',
    '<div class="admonition warning" role="alert" data-djot-admonition-type="warning" data-djot-admonition-title="Watch Out!">'
    + '<p class="admonition-title">Watch Out!</p><p>Body.</p></div>',
    '{title="Watch Out!"}\n::: admonition warning\nBody.\n:::');

check('round-trip mode auto-generated title is not frozen into the source',
    '<div class="admonition note" role="note" data-djot-admonition-type="note">'
    + '<p class="admonition-title">Note</p><p>Body.</p></div>',
    '::: admonition note\nBody.\n:::');

check('default title in plain rendered HTML becomes an explicit title (renders identically)',
    '<div class="admonition note" role="note">'
    + '<p class="admonition-title">Note</p><p>Body.</p></div>',
    '{title="Note"}\n::: admonition note\nBody.\n:::');

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
    process.exit(1);
}
