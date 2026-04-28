import DOMPurify from 'dompurify';

const CONFIG = {
	ALLOWED_TAGS: [ 'p', 'br', 'a' ],
	ALLOWED_ATTR: [ 'href', 'rel', 'target' ],
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
