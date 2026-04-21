import { loadBlackboxSdk } from 'calypso/blocks/login/utils/blackbox-sdk';

/**
 * Retrieve a Blackbox bot-detection session ID.
 *
 * Awaits the lazy SDK load, calls collect() to trigger data collection, and
 * returns the session ID. Blackbox returns BlackboxError instead of throwing,
 * so the typeof check filters those out. The try/catch is defense-in-depth.
 *
 * @returns {Promise<string|undefined>} Session ID, or undefined on any failure.
 */
export async function getBlackboxSessionId() {
	try {
		await Promise.race( [
			loadBlackboxSdk(),
			new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ),
		] );
	} catch {
		// loadBlackboxSdk() always resolves, but guard here in case that contract changes.
		return undefined;
	}

	if ( ! window.Blackbox?.collect ) {
		return undefined;
	}

	try {
		const result = await Promise.race( [
			window.Blackbox.collect(),
			new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ),
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
