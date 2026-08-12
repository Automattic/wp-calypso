import { useEffect } from '@wordpress/element';

/**
 * Publish actions onto `window.__agentsManagerActions`. Cleanup removes only
 * keys whose value is still ours, so callers can co-own the global.
 */
export function useRegisterCustomActions( actions: Partial< AgentsManagerActions > ): void {
	// No deps array: re-sync every commit so the global stays correct even when
	// the set of keys changes (a computed deps array must keep a fixed length).
	useEffect( () => {
		const current = ( window.__agentsManagerActions ??= {} as AgentsManagerActions );
		Object.assign( current, actions );

		return () => {
			// Re-read the global rather than reusing `current`: a consumer may have
			// replaced it since we published, and we must clean up the live object.
			const latest = window.__agentsManagerActions;
			if ( ! latest ) {
				return;
			}
			( Object.keys( actions ) as ( keyof AgentsManagerActions )[] ).forEach( ( key ) => {
				if ( latest[ key ] === actions[ key ] ) {
					delete latest[ key ];
				}
			} );
		};
	} );
}
