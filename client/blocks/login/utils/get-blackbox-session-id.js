import { ensureBlackboxLoginScript } from 'calypso/blocks/login/utils/ensure-blackbox-login-script';
import { getInlineScriptNonce } from 'calypso/blocks/login/utils/get-inline-script-nonce';

/**
 * Retrieve a Blackbox bot-detection session ID, if the library is loaded.
 *
 * Blackbox returns `BlackboxError` instead of throwing, so the `typeof`
 * check filters those out. The try/catch is defense-in-depth in case the
 * third-party script misbehaves — Blackbox must never block login.
 * @returns {Promise<string|undefined>} Session ID, or undefined on failure.
 */
export async function getBlackboxSessionId() {
	await ensureBlackboxLoginScript( getInlineScriptNonce() );

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
