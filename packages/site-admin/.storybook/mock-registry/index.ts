/**
 * External dependencies
 */
import { createReduxStore, createRegistry } from '@wordpress/data';

/**
 * Types
 */
import type { MockStores } from './stores';
type WPDataRegistry = ReturnType< typeof createRegistry >;

/**
 * Registers a mock store with the given initial state.
 */
const registerMockStore = ( registry, storeName, initialState ) => {
	const store = createReduxStore( storeName, {
		reducer: ( state = initialState ) => state,
		selectors: {
			getEntityRecord: ( state, kind, name ) => {
				const mockStateKey = `${ kind }/${ name }`;
				if ( ! state[ mockStateKey ] ) {
					return null;
				}

				return state[ mockStateKey ];
			},
		},
		actions: {},
	} );

	registry.register( store );
};

/**
 * Creates a global mock registry for @wordpress/data
 */
export const createMockRegistry = ( stores: MockStores ): WPDataRegistry => {
	const registry = createRegistry();

	Object.entries( stores ).forEach( ( [ storeName, initialState ] ) => {
		registerMockStore( registry, storeName, initialState );
	} );

	return registry;
};
