import { subscribe } from '@wordpress/data';

/**
 * Resolves once `isReady()` holds, or false if `timeoutMs` passes first.
 *
 * The editor settles asynchronously with no promise to await, so waiting on
 * the store's own change beats polling on a fixed interval.
 */
export function waitForStore(
	storeName: string,
	isReady: () => boolean,
	timeoutMs: number
): Promise< boolean > {
	// A selector can throw while its store is unavailable; the contract is a
	// boolean either way.
	const ready = () => {
		try {
			return isReady();
		} catch {
			return false;
		}
	};

	if ( ready() ) {
		return Promise.resolve( true );
	}

	return new Promise( ( resolve ) => {
		let settled = false;
		// A holder, so `finish` can clear handles that are assigned after it.
		const pending: { timer?: ReturnType< typeof setTimeout >; unsubscribe?: () => void } = {};

		const finish = ( result: boolean ) => {
			if ( settled ) {
				return;
			}
			settled = true;
			clearTimeout( pending.timer );
			pending.unsubscribe?.();
			resolve( result );
		};

		pending.timer = setTimeout( () => finish( false ), timeoutMs );
		pending.unsubscribe = subscribe( () => {
			if ( ready() ) {
				finish( true );
			}
		}, storeName );

		// A change that landed while the listener was attaching fires nothing.
		if ( ready() ) {
			finish( true );
		}
	} );
}
