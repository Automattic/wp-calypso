/**
 * Retrieve a Blackbox bot-detection session ID, if the library is loaded.
 *
 * Blackbox returns `BlackboxError` instead of throwing, so the `typeof`
 * check filters those out. The try/catch is defense-in-depth in case the
 * third-party script misbehaves — Blackbox must never block login.
 * @returns {Promise<string|undefined>} Session ID, or undefined on failure.
 */
export async function getBlackboxSessionId() {
	if ( ! window.Blackbox?.getSessionId ) {
		return undefined;
	}

	try {
		const result = await Promise.race( [
			window.Blackbox.getSessionId(),
			new Promise( ( resolve ) => setTimeout( resolve, 2000 ) ),
		] );
		if ( typeof result === 'string' ) {
			return result;
		}
	} catch {
		// Intentionally ignored — Blackbox must never block login.
	}
	return undefined;
}
