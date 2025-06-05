/**
 * External dependencies
 */
import { createReduxStore, createRegistry } from '@wordpress/data';
import { action } from '@storybook/addon-actions';

/**
 * Types
 */
import type { MockStores } from './stores';
type WPDataRegistry = ReturnType< typeof createRegistry >;

/**
 * Registers a mock store with the given initial state.
 */
import { store as commandsStore } from '@wordpress/commands';

const registerMockStore = ( registry, storeName, initialState ) => {
	/*
	 * `core/commands` store
	 */
	if ( storeName === commandsStore.name ) {
		const mockCommandsStore = createReduxStore( storeName, {
			reducer: ( state = { isOpen: false }, action ) => {
				switch ( action.type ) {
					case 'OPEN':
						return { ...state, isOpen: true };
					case 'CLOSE':
						return { ...state, isOpen: false };
					default:
						return state;
				}
			},
			actions: {
				open: () => {
					action( '[`core/commands`] Open Command Center' )();
					return { type: 'OPEN' };
				},
				close: () => {
					action( '[`core/commands`] Close Command Center' )();
					return { type: 'CLOSE' };
				},
			},
			selectors: {
				isOpen: ( state ) => state.isOpen,
			},
		} );

		registry.register( mockCommandsStore );
		return;
	}

	/*
	 * `core` store
	 */
	const store = createReduxStore( storeName, {
		reducer: ( state = initialState ) => state,
		selectors: {
			getEntityRecord: ( state, kind, name ) => {
				const mockStateKey = `${ kind }/${ name }`;
				return state[ mockStateKey ] || null;
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
