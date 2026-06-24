import { loadBlackboxSdk } from 'calypso/blocks/login/utils/blackbox-sdk';

/**
 * Retrieve a Blackbox bot-detection session ID.
 *
 * Awaits the lazy SDK load, then calls collect() to flush accumulated
 * behavioral data (keypress timing, mouse movements, etc.) to the server.
 * This ensures the server-side session score reflects behavioral signals
 * before the login request fires — critical for enforcement via verify().
 *
 * collect() is safe to call at submit time because the login form's submit
 * button is disabled while Blackbox is loading or a challenge is active, so
 * this only fires when no challenge widget is in progress.
 *
 * Blackbox returns BlackboxError instead of throwing, so the typeof check
 * filters those out. The try/catch is defense-in-depth.
 * @returns {Promise<string|undefined>} Session ID, or undefined on any failure.
 */
export async function getBlackboxSessionId() {
	try {
		await Promise.race( [
			loadBlackboxSdk(),
			new Promise( ( resolve ) => setTimeout( resolve, 5000 ) ),
		] );
	} catch {
		// loadBlackboxSdk() always resolves, but guard here in case that contract changes.
		return undefined;
	}

	if ( typeof window.Blackbox?.collect !== 'function' ) {
		return undefined;
	}

	try {
		const result = await Promise.race( [
			window.Blackbox.collect(),
			new Promise( ( resolve ) => setTimeout( resolve, 5000 ) ),
		] );

		if ( typeof result === 'string' ) {
			return result;
		}

		if ( result && typeof result.sessionId === 'string' ) {
			return result.sessionId;
		}
	} catch {
		// Intentionally ignored — Blackbox must never block login.
	}

	return undefined;
}
