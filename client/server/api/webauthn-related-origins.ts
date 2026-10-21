import type { Express, Request, Response } from 'express';

// Lets the listed origins assert WebAuthn credentials scoped to this host's RP ID
// (e.g. keys mistakenly registered against my.wordpress.com, usable at wordpress.com login).
// https://passkeys.dev/docs/advanced/related-origins/
const RELATED_ORIGINS = [ 'https://wordpress.com' ];

export default function ( app: Express ) {
	return app.get( '/.well-known/webauthn', ( request: Request, response: Response ) => {
		// The browser fetches this document cross-origin from the related origin
		// performing the ceremony, so it must be readable from that origin.
		response.set( 'Access-Control-Allow-Origin', 'https://wordpress.com' );
		response.json( { origins: RELATED_ORIGINS } );
	} );
}
