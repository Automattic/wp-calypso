import DOMPurify from 'dompurify';

// Post content can hold markup an agent wrote; nothing the page renders from it should run or
// navigate this page. Comments are block delimiters; block-editor's InnerContent mounts nested
// blocks in `wp-inner-block-slot` elements, found by their `data-slot-index`.
const PURIFY_CONFIG = {
	ADD_TAGS: [ '#comment', 'wp-inner-block-slot' ],
	FORCE_BODY: true,
	FORBID_TAGS: [ 'iframe', 'object', 'embed', 'form', 'base', 'meta', 'style', 'script', 'link' ],
	ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

// For rendering only: what the page sends back to the server stays as the server stored it.
// Also replaces @wordpress/dom's safeHTML (see webpack.config.js), which keeps iframes, so a
// `srcdoc` or `javascript:` iframe in a Custom HTML, unknown or invalid block would run here.
export default function sanitize( html: string ) {
	return DOMPurify.sanitize( html, PURIFY_CONFIG );
}
