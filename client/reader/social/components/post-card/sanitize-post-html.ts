import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

const CONFIG = {
	ALLOWED_TAGS: [ 'p', 'br', 'a' ],
	// `data-id` carries the protocol's stable author identifier (DID for
	// atmosphere, numeric account id for Mastodon) on @-mention anchors,
	// emitted by the backend so the client can route mentions in-app
	// without parsing the href.
	ALLOWED_ATTR: [ 'href', 'rel', 'target', 'data-id', 'data-tag' ],
	// DOMPurify allows every data-* attribute by default; restrict to the
	// explicit allow-list above so a future backend change can't smuggle
	// a new data-* attribute (e.g. `data-tracking`) through to the DOM.
	ALLOW_DATA_ATTR: false,
	// DOMPurify scheme-checks every attribute value containing a colon and
	// drops the attribute when the scheme isn't on its URI allow-list.
	// Atmosphere DID values (`did:plc:…`) trip that check on `data-id` and
	// would otherwise be stripped, so opt this attribute out of URI parsing.
	// `ADD_URI_SAFE_ATTR` extends DOMPurify's defaults; using
	// `URI_SAFE_ATTRIBUTES` would replace them and drop `xml:lang` etc.
	ADD_URI_SAFE_ATTR: [ 'data-id' ],
};

function hardenAnchorAttributes( node: Element ) {
	if ( node.tagName !== 'A' ) {
		return;
	}
	node.setAttribute( 'target', '_blank' );
	const existing = ( node.getAttribute( 'rel' ) || '' ).split( /\s+/ ).filter( Boolean );
	for ( const token of [ 'nofollow', 'noopener', 'noreferrer' ] ) {
		if ( ! existing.includes( token ) ) {
			existing.push( token );
		}
	}
	node.setAttribute( 'rel', existing.join( ' ' ) );
}

export function sanitizeReaderSocialHtml( html: string, config: Config ): string {
	DOMPurify.addHook( 'afterSanitizeAttributes', hardenAnchorAttributes );
	try {
		return DOMPurify.sanitize( html, config );
	} finally {
		DOMPurify.removeHook( 'afterSanitizeAttributes', hardenAnchorAttributes );
	}
}

export function sanitizePostHtml( html: string ): string {
	if ( ! html ) {
		return '';
	}
	return sanitizeReaderSocialHtml( html, CONFIG );
}
