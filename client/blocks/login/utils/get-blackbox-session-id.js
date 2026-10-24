import { loadBlackboxSdk } from 'calypso/blocks/login/utils/blackbox-sdk';
import { configureBlackbox, getBlackboxSignal } from 'calypso/blocks/login/utils/blackbox-surface';

/**
 * Flush telemetry and wait for active challenges before submission.
 * Undefined permits submission without a session; null cancels an obsolete submission.
 * @param {string} apiKey Public key for this surface.
 * @param {AbortSignal} [signal] Lifetime of the submitting form.
 * @returns {Promise<string|undefined|null>} Current ID, no session, or cancellation.
 */
export async function getBlackboxSessionId( apiKey, signal = getBlackboxSignal( apiKey ) ) {
	let loadTimer;
	let unsubscribe;
	let cancel;
	const cancelled = new Promise( ( resolve ) => {
		cancel = () => resolve( null );
		signal?.addEventListener( 'abort', cancel, { once: true } );
	} );

	try {
		if ( signal?.aborted ) {
			return null;
		}
		await Promise.race( [
			loadBlackboxSdk( apiKey ),
			new Promise( ( resolve ) => {
				loadTimer = setTimeout( resolve, 5000 );
			} ),
			cancelled,
		] );
		clearTimeout( loadTimer );
		if ( signal?.aborted ) {
			return null;
		}
		const api = typeof window === 'undefined' ? undefined : window.Blackbox;
		if ( ! api?.flush || ! api.subscribe || ! api.getSnapshot ) {
			return undefined;
		}

		let notify;
		let needsRefresh = false;
		unsubscribe = api.subscribe( ( state ) => {
			if ( state.status === 'loading' ) {
				needsRefresh = true;
			}
			notify?.();
		} );
		configureBlackbox( api, { apiKey } );

		while ( ! signal?.aborted ) {
			await Promise.race( [ api.flush( { deadlineMs: 5000 } ), cancelled ] );
			if ( signal?.aborted ) {
				return null;
			}
			needsRefresh = false;
			while ( api.getSnapshot().status === 'challenge' && ! signal?.aborted ) {
				await Promise.race( [
					new Promise( ( resolve ) => {
						notify = resolve;
					} ),
					cancelled,
				] );
			}
			if ( signal?.aborted ) {
				return null;
			}
			if ( needsRefresh ) {
				continue;
			}
			return api.getSnapshot().sessionId || undefined;
		}
		return null;
	} catch {
		return signal?.aborted ? null : undefined;
	} finally {
		clearTimeout( loadTimer );
		unsubscribe?.();
		signal?.removeEventListener( 'abort', cancel );
	}
}
