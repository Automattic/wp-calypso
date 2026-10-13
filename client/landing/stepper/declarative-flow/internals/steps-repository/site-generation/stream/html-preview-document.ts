import DOMPurify from 'dompurify';

export const MAX_PREVIEW_HTML_BYTES = 262144;

const PREVIEW_CSP =
	"default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; form-action 'none'; base-uri 'none';";

/** Keep generated markup out of Calypso's DOM and prevent preview navigation/network access. */
export function htmlPreviewDocument( html: string ): string {
	const root = DOMPurify.sanitize( html, {
		WHOLE_DOCUMENT: true,
		RETURN_DOM: true,
		USE_PROFILES: { html: true },
		ADD_TAGS: [ 'style' ],
		FORBID_TAGS: [
			'base',
			'meta',
			'link',
			'script',
			'iframe',
			'object',
			'embed',
			'form',
			'input',
			'button',
			'select',
			'textarea',
			'img',
			'picture',
			'source',
			'video',
			'audio',
		],
		FORBID_ATTR: [
			'href',
			'src',
			'srcset',
			'action',
			'formaction',
			'ping',
			'background',
			'poster',
		],
	} );
	if ( ! ( root instanceof Element ) ) {
		return '';
	}
	const head = root.querySelector( 'head' );
	if ( ! head ) {
		return '';
	}
	const policy = document.createElement( 'meta' );
	policy.httpEquiv = 'Content-Security-Policy';
	policy.content = PREVIEW_CSP;
	head.prepend( policy );
	return '<!doctype html>' + root.outerHTML;
}
