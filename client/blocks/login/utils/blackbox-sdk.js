import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';

const CHALLENGE_CONTAINER = '#blackbox-challenge-root';

/** Mutable slots — login-form.jsx writes these in componentDidMount. */
export const challengeCallbacks = {
	onChallengeStart: null,
	onChallengeComplete: null,
};

let loadPromise = null;

/**
 * Inject the Blackbox SDK script once and call configure() after it loads.
 * Returns a Promise that always resolves (never rejects) so Blackbox can never block login.
 * Subsequent calls return the same Promise — the script is only injected once.
 *
 * @returns {Promise<void>}
 */
export function loadBlackboxSdk() {
	if ( typeof document === 'undefined' ) {
		return Promise.resolve();
	}

	if ( ! config.isEnabled( 'blackbox-login' ) || ! config( 'blackbox_api_key' ) ) {
		return Promise.resolve();
	}

	if ( loadPromise ) {
		return loadPromise;
	}

	const blackboxUrl = config( 'blackbox_url' );
	if ( typeof blackboxUrl !== 'string' || ! blackboxUrl ) {
		return Promise.resolve();
	}

	loadPromise = new Promise( ( resolve ) => {
		loadScript(
			blackboxUrl,
			( error ) => {
				if ( ! error ) {
					configureBlackboxSdk();
				}
				resolve();
			},
			{ 'data-apikey': config( 'blackbox_api_key' ) }
		);
	} );

	return loadPromise;
}

/**
 * Call window.Blackbox.configure() with the complete config.
 * Wrapper functions delegate to challengeCallbacks slots so configure() only
 * needs to be called once — updating the slots is enough to change callbacks.
 */
function configureBlackboxSdk() {
	if ( typeof window.Blackbox?.configure !== 'function' ) {
		return;
	}

	try {
		window.Blackbox.configure( {
			apiKey: config( 'blackbox_api_key' ),
			challengeContainer: CHALLENGE_CONTAINER,
			onChallengeStart: () => challengeCallbacks.onChallengeStart?.(),
			onChallengeComplete: () => challengeCallbacks.onChallengeComplete?.(),
		} );
	} catch {
		// Intentionally ignored — Blackbox must never block login.
	}
}
