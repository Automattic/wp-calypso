import { domForHtml, fragmentForHtml } from './utils';

// Markup that a parse rearranges (block content inside a `p`, rows outside a table) settles after
// one more round. Content still changing after this many is built to dodge the sanitizers.
const MAX_REPARSES = 3;

function escapeText( text ) {
	const container = fragmentForHtml( '' );
	container.textContent = text;
	return container.innerHTML;
}

/**
 * Serializes `dom` into a string whose own parse the sanitizers have checked.
 *
 * The rules work on one parse of the content, but the browser renders a new parse of the string
 * built from it, and the two can differ: foreign (SVG, MathML) content, table fix-ups and elements
 * a rule moved can turn what the rules saw as text into elements they never checked. So parse the
 * string the way the browser will, sanitize that, and repeat until a round no longer changes it.
 * @param {Object} post The post
 * @param {Element} dom The DOM for the post's content
 * @param {Function[]} sanitizers Rules that must hold on the rendered content
 * @returns {string} The content to render
 */
function serializeSafely( post, dom, sanitizers ) {
	let html = dom.innerHTML;
	let reparsed = dom;

	for ( let round = 0; round < MAX_REPARSES; round++ ) {
		reparsed = fragmentForHtml( html );
		sanitizers.forEach( ( sanitize ) => sanitize( post, reparsed ) );

		const next = reparsed.innerHTML;
		if ( next === html ) {
			return html;
		}
		html = next;
	}

	return escapeText( reparsed.textContent );
}

export default function createDomTransformRunner( transforms, sanitizers = [] ) {
	return function withContentDOM( post ) {
		if ( ! post || ! post.content || ! transforms ) {
			return post;
		}

		const dom = domForHtml( post.content );

		post = transforms.reduce( ( memo, transform ) => {
			return transform( memo, dom );
		}, post );

		post.content = sanitizers.length ? serializeSafely( post, dom, sanitizers ) : dom.innerHTML;
		dom.innerHTML = '';

		return post;
	};
}
