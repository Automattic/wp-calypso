import config from '@automattic/calypso-config';
import { BLACKBOX_CHALLENGE_ROOT_ID } from 'calypso/blocks/login/utils/blackbox-challenge-root-id';

const BLACKBOX_HOST_MARKER = 'blackbox-api.wp.com';

let loadPromise: Promise< void > | null = null;

function getCspNonceForScripts(): string | undefined {
	const el = document.querySelector( 'script[nonce]' );
	if ( el instanceof HTMLScriptElement && el.nonce ) {
		return el.nonce;
	}
	return el?.getAttribute( 'nonce' ) ?? undefined;
}

/**
 * Injects Blackbox-js after the login form mount so the library does not run at page boot.
 * The challenge container node must already be in the DOM before the script executes.
 */
export function ensureBlackboxLoginScript(): Promise< void > {
	if ( typeof document === 'undefined' ) {
		return Promise.resolve();
	}

	if ( ! config.isEnabled( 'blackbox-login' ) || ! config( 'blackbox_api_key' ) ) {
		return Promise.resolve();
	}

	if ( window.Blackbox?.getSessionId ) {
		return Promise.resolve();
	}

	if ( loadPromise ) {
		return loadPromise;
	}

	loadPromise = new Promise( ( resolve ) => {
		const finish = () => resolve();

		const existing = document.querySelector< HTMLScriptElement >(
			`script[src*="${ BLACKBOX_HOST_MARKER }"]`
		);

		if ( existing ) {
			if ( window.Blackbox?.getSessionId ) {
				finish();
				return;
			}
			existing.addEventListener( 'load', finish, { once: true } );
			existing.addEventListener( 'error', finish, { once: true } );
			setTimeout( finish, 10000 );
			return;
		}

		const script = document.createElement( 'script' );
		script.src = config( 'blackbox_url' );
		const nonce = getCspNonceForScripts();
		if ( nonce ) {
			script.nonce = nonce;
		}
		script.setAttribute( 'data-apikey', config( 'blackbox_api_key' ) );
		script.setAttribute( 'data-challenge-container', `#${ BLACKBOX_CHALLENGE_ROOT_ID }` );

		script.addEventListener( 'load', finish, { once: true } );
		script.addEventListener( 'error', finish, { once: true } );
		setTimeout( finish, 10000 );

		document.body.appendChild( script );
	} );

	return loadPromise;
}
