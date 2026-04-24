import { loadBlackboxSdk } from 'calypso/blocks/login/utils/blackbox-sdk';

/**
 * Retrieve a Blackbox bot-detection session ID.
 *
 * Awaits the lazy SDK load, then calls getSessionId() which returns the
 * cached session ID immediately (non-blocking) and ships accumulated
 * behavioral data in the background.
 *
 * Blackbox returns BlackboxError instead of throwing, so the typeof check
 * filters those out. The try/catch is defense-in-depth.
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

	if ( typeof window.Blackbox?.getSessionId !== 'function' ) {
		return undefined;
	}

	try {
		const sessionId = await Promise.race( [
			window.Blackbox.getSessionId(),
			new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ),
		] );

		if ( typeof sessionId === 'string' ) {
			return sessionId;
		}
	} catch {
		// Intentionally ignored — Blackbox must never block login.
	}

	return undefined;
}
