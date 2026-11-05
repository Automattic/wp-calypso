import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';

let loadPromise = null;

// wpcom verifies a signup with the key named by `blackbox_key_version`; no
// version means the legacy signup key. A session verified with a key other
// than the one that collected it is blocked, so a key and its version must
// always travel together.
const CALYPSO_PROD_KEY_VERSION = 2;

/**
 * Public key for a Blackbox surface, with the version wpcom verifies it by.
 * @param {Object}  [options]
 * @param {boolean} [options.legacySignupKey] Collect with `blackbox_signup_api_key`.
 * Only the magic-login page uses it, until it moves to the `calypso_prod` key.
 * @returns {{ apiKey: string|undefined, keyVersion: number|undefined }} Configured public key and its version.
 */
export function getBlackboxKey( { legacySignupKey = false } = {} ) {
	const configApiKey = config( legacySignupKey ? 'blackbox_signup_api_key' : 'blackbox_api_key' );
	const keyVersion = legacySignupKey ? undefined : CALYPSO_PROD_KEY_VERSION;

	if ( process.env.NODE_ENV === 'development' ) {
		// Guarded require so the dev-only override module is dead-code
		// eliminated from production bundles.
		const { resolveBlackboxApiKey } = require( 'calypso/lib/blackbox-helper/api-key' );
		return { apiKey: resolveBlackboxApiKey( configApiKey ), keyVersion };
	}

	return { apiKey: configApiKey, keyVersion };
}

/**
 * Blackbox fields for a `/users/new` body. The key version is taken from the
 * collect that produced the session, so the two can't disagree.
 * @param {string|undefined} sessionId  Session ID from collect.
 * @param {number|undefined} keyVersion Version of the key that collected it.
 * @returns {{ blackbox_session_id?: string, blackbox_key_version?: number }} Fields to spread into the body.
 */
export function getBlackboxSignupFields( sessionId, keyVersion ) {
	if ( ! sessionId ) {
		return {};
	}

	return {
		blackbox_session_id: sessionId,
		...( keyVersion && { blackbox_key_version: keyVersion } ),
	};
}

/**
 * Inject the Blackbox SDK script once.
 * Returns a Promise that always resolves (never rejects) so Blackbox can never block login.
 * Subsequent calls return the same Promise — the script is only injected once.
 *
 * Callers are responsible for calling window.Blackbox.configure() after this resolves.
 * The script loads once, and this key is what auto-init collects with.
 * @param {string} apiKey Public key stamped on the script tag.
 * @returns {Promise<void>}
 */
export function loadBlackboxSdk( apiKey ) {
	if ( typeof document === 'undefined' ) {
		return Promise.resolve();
	}

	if ( ! config.isEnabled( 'blackbox' ) || ! apiKey ) {
		return Promise.resolve();
	}

	if ( loadPromise ) {
		return loadPromise;
	}

	const blackboxUrl = config( 'blackbox_url' );
	if ( typeof blackboxUrl !== 'string' || ! blackboxUrl ) {
		return Promise.resolve();
	}

	let didFailSynchronously = false;
	const scriptLoadPromise = new Promise( ( resolve ) => {
		loadScript(
			blackboxUrl,
			( error ) => {
				if ( error ) {
					didFailSynchronously = true;
					loadPromise = null;
				}
				resolve();
			},
			{ 'data-apikey': apiKey }
		);
	} );

	loadPromise = didFailSynchronously ? null : scriptLoadPromise;

	return scriptLoadPromise;
}
