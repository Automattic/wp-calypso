import { useEffect } from '@wordpress/element';

/**
 * Register a set of action callbacks on `window.__agentsManagerActions`,
 * cleaning up only the keys this caller wrote.
 *
 * Multiple components can write to the same global object (for example
 * `useSetupCustomActions` in `AgentDock` and component-local actions in
 * `OrchestratorChat`). The cleanup compares each key's current value
 * against the callback identity this hook registered, so a fresh
 * registration that has already replaced our value is left intact and
 * registrations from other consumers are never touched.
 *
 * Callers should wrap each callback in `useCallback` so identities only
 * change when their inputs do — otherwise the registration effect re-runs
 * every render.
 * @param actions Map of action keys to callback functions.
 */
export default function useRegisterCustomActions( actions: Partial< AgentsManagerActions > ): void {
	useEffect(
		() => {
			window.__agentsManagerActions =
				window.__agentsManagerActions || ( {} as AgentsManagerActions );

			const target = window.__agentsManagerActions;
			const keys = Object.keys( actions ) as Array< keyof AgentsManagerActions >;

			keys.forEach( ( key ) => {
				( target as unknown as Record< string, unknown > )[ key ] = actions[ key ];
			} );

			return () => {
				const current = window.__agentsManagerActions;
				if ( ! current ) {
					return;
				}
				keys.forEach( ( key ) => {
					if ( current[ key ] === actions[ key ] ) {
						delete ( current as unknown as Record< string, unknown > )[ key ];
					}
				} );
			};
		},
		// Re-run whenever any callback identity changes. The `actions`
		// object is recreated on every render, so we depend on its values
		// (which are expected to be memoized) rather than the object itself.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		Object.values( actions )
	);
}
