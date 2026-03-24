import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Djot Embed node extension for Tiptap
 *
 * Preserves video embeds, iframes, and oEmbed content during round-trips.
 * Stores the original Djot source (e.g., YouTube URL) in data-djot-src.
 *
 * @example
 * ```js
 * import { DjotEmbed } from 'djot-grammars/tiptap'
 *
 * const editor = new Editor({
 *   extensions: [DjotEmbed],
 * })
 *
 * // Insert an embed
 * editor.chain().focus().setDjotEmbed({
 *   src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
 *   html: '<iframe...></iframe>',
 * }).run()
 * ```
 */
export const DjotEmbed = Node.create({
    name: 'djotEmbed',

    group: 'block',

    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: element => {
                    // Check for data-djot-src first
                    const djotSrc = element.getAttribute('data-djot-src');
                    if (djotSrc) return djotSrc;
                    // Check for iframe src
                    const iframe = element.querySelector('iframe');
                    if (iframe) return iframe.getAttribute('src');
                    // Check for video source
                    const video = element.querySelector('video source');
                    if (video) return video.getAttribute('src');
                    return null;
                },
                renderHTML: attributes => {
                    if (!attributes.src) return {};
                    return { 'data-djot-src': attributes.src };
                },
            },
            html: {
                default: null,
                parseHTML: element => element.innerHTML,
                renderHTML: () => ({}),
            },
        };
    },

    parseHTML() {
        return [
            // Match WordPress embed wrappers
            { tag: 'figure.wp-block-embed' },
            { tag: 'div.wp-block-embed' },
            // Match wpdjot-embed class
            { tag: 'figure.wpdjot-embed' },
            { tag: 'div.wpdjot-embed' },
            // Match elements with data-djot-src
            { tag: '[data-djot-src]' },
            // Match iframes that look like video embeds
            {
                tag: 'iframe',
                getAttrs: element => {
                    const src = element.getAttribute('src') || '';
                    // Only match video embed iframes
                    if (src.includes('youtube') || src.includes('vimeo') ||
                        src.includes('dailymotion') || src.includes('wistia')) {
                        return {};
                    }
                    return false;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = node.attrs.html || '';

        return ['figure', mergeAttributes(HTMLAttributes, {
            class: 'wpdjot-embed',
            'data-djot-src': node.attrs.src,
        }), node.attrs.html ? ['div', { innerHTML: node.attrs.html }] : ['p', 'Embedded content']];
    },

    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('figure');
            dom.classList.add('wpdjot-embed');
            if (node.attrs.src) {
                dom.setAttribute('data-djot-src', node.attrs.src);
            }
            dom.innerHTML = node.attrs.html || `<p>Embedded: ${node.attrs.src || 'unknown'}</p>`;
            return { dom };
        };
    },

    addCommands() {
        return {
            setDjotEmbed: (attributes) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: attributes,
                });
            },
        };
    },
});

export default DjotEmbed;
