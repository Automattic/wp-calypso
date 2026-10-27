import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';

let loadPromise = null;

// Account creation collects under its own client so its thresholds stay
// independent of login. Logged-out checkout creates the account.
const SIGNUP_FEATURES = new Set( [ 'blackbox-signup', 'blackbox-userless-checkout' ] );

/**
 * Public key for a Blackbox surface.
 * @param {string} [feature] Feature flag for the surface. Signup surfaces use `blackbox_signup_api_key`.
 * @returns {string|undefined} Configured public key.
 */
export function getBlackboxApiKey( feature ) {
	const configKey = SIGNUP_FEATURES.has( feature ) ? 'blackbox_signup_api_key' : 'blackbox_api_key';
	const configApiKey = config( configKey );

	if ( process.env.NODE_ENV === 'development' ) {
		// Guarded require so the dev-only override module is dead-code
		// eliminated from production bundles.
		const { resolveBlackboxApiKey } = require( 'calypso/lib/blackbox-helper/api-key' );
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
