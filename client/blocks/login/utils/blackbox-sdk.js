import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';

let loadPromise = null;

/**
 * Inject the Blackbox SDK script once.
 * Returns a Promise that always resolves (never rejects) so Blackbox can never block login.
 * Subsequent calls return the same Promise — the script is only injected once.
 *
 * Callers are responsible for calling window.Blackbox.configure() after this resolves.
 * @returns {Promise<void>}
 */
export function loadBlackboxSdk() {
	if ( typeof document === 'undefined' ) {
		return Promise.resolve();
	}

	const apiKey = config( 'blackbox_api_key' );
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
