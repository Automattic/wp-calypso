import DOMPurify from 'dompurify';
import makeEmbedsSafe from 'calypso/lib/post-normalizer/rule-content-make-embeds-safe';
import type { Config } from 'dompurify';

// Comments come from every site the Reader shows, and a site can store comments with more markup
// than the comment allowlist permits, so comment markup is never trusted as sent.
const CONFIG: Config & { RETURN_DOM_FRAGMENT: true } = {
	ADD_TAGS: [ 'iframe' ],
	ADD_ATTR: [ 'allowfullscreen', 'frameborder', 'target' ],
	FORBID_TAGS: [ 'style', 'form', 'input', 'button', 'select', 'textarea' ],
	// Comments are styled by the Reader, not by themselves, and don't name globals on the page.
	FORBID_ATTR: [ 'style', 'id', 'name' ],
	RETURN_DOM_FRAGMENT: true,
};

/**
 * Sanitizes comment HTML for rendering in Calypso, sandboxing embeds the way the Reader does for posts.
 */
export function sanitizeCommentHtml( html: string ): string {
	const fragment = DOMPurify.sanitize( html, CONFIG );
	makeEmbedsSafe( null, fragment );

	const container = fragment.ownerDocument.createElement( 'div' );
	container.append( fragment );
	return container.innerHTML;
}
