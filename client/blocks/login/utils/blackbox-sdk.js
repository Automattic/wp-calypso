import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { rememberBlackboxKey } from 'calypso/blocks/login/utils/blackbox-surface';
import { resolveBlackboxApiKey } from 'calypso/lib/blackbox-helper/api-key';

let loadPromise = null;

// Sent with a signup session so wpcom verifies it with `blackbox_api_key`.
// A signup that sends no version is verified with `blackbox_signup_api_key`.
export const BLACKBOX_KEY_VERSION = 2;

/**
 * Public key for Blackbox collects.
 * @returns {string|undefined} Configured public key.
 */
export function getBlackboxApiKey() {
	const configApiKey = config( 'blackbox_api_key' );

	if ( process.env.NODE_ENV === 'development' ) {
		return resolveBlackboxApiKey( configApiKey );
	}

	return configApiKey;
}

/**
 * Inject the Blackbox SDK script once.
 * Returns a Promise that always resolves (never rejects) so Blackbox can never block login.
 * Subsequent calls return the same Promise — the script is only injected once.
 *
 * Callers are responsible for calling window.Blackbox.configure() after this resolves.
 * The script loads once, and this key is what auto-init collects with.
 * @param {string} apiKey Public key stamped on the script tag.
 * @param {'login'|'signup'} flow Collect flow for `data-flow` on the script tag.
 * @returns {Promise<void>}
 */
export function loadBlackboxSdk( apiKey, flow ) {
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
				} else {
					rememberBlackboxKey( window.Blackbox, apiKey );
				}
				resolve();
			},
			{
				'data-apikey': apiKey,
				'data-flow': flow,
			}
		);
	} );

	loadPromise = didFailSynchronously ? null : scriptLoadPromise;

	return scriptLoadPromise;
}
