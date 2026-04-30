import DOMPurify from 'dompurify';

const CONFIG = {
	ALLOWED_TAGS: [ 'p', 'br', 'a' ],
	// `data-id` carries the protocol's stable author identifier (DID for
	// atmosphere, numeric account id for Mastodon) on @-mention anchors,
	// emitted by the backend so the client can route mentions in-app
	// without parsing the href.
	ALLOWED_ATTR: [ 'href', 'rel', 'target', 'data-id' ],
	// DOMPurify allows every data-* attribute by default; restrict to the
	// explicit allow-list above so a future backend change can't smuggle
	// a new data-* attribute (e.g. `data-tracking`) through to the DOM.
	ALLOW_DATA_ATTR: false,
};

let hookRegistered = false;

function ensureHook() {
	if ( hookRegistered ) {
		return;
	}
	DOMPurify.addHook( 'afterSanitizeAttributes', ( node ) => {
		if ( node.tagName !== 'A' ) {
			return;
		}
		const target = node.getAttribute( 'target' );
		if ( target?.toLowerCase() !== '_blank' ) {
			return;
		}
		const existing = ( node.getAttribute( 'rel' ) || '' ).split( /\s+/ ).filter( Boolean );
		for ( const token of [ 'nofollow', 'noopener', 'noreferrer' ] ) {
			if ( ! existing.includes( token ) ) {
				existing.push( token );
			}
		}
		node.setAttribute( 'rel', existing.join( ' ' ) );
	} );
	hookRegistered = true;
}

export function sanitizePostHtml( html: string ): string {
	if ( ! html ) {
		return '';
	}
	ensureHook();
	return DOMPurify.sanitize( html, CONFIG );
}
