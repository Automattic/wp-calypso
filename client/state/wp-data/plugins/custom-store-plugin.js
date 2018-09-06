/** @format */
/**
 * External dependencies
 */
import { findKey } from 'lodash';

/**
 * Creates a plugin that allows custom store implementations.
 *
 * IMPORTANT: This plugin depends on the `internals-plugin` to work.
 *            It must be given a registry already using that plugin.
 *
 * @param {Object} registry The original registry to wrap.
 * @return {Object} The wrapped registry from this plugin.
 */
function customStorePlugin( registry ) {
	if ( ! registry._internals ) {
		throw TypeError( 'Expected a registry with _internals. See internals-plugin' );
	}

	/**
	 * Registers a custom store with actions and selectors.
	 *
	 * @param {string} reducerKey Reducer key.
	 * @param {Object} store Existing redux-like store to be used.
	 * @return {Object} Store originally given, now registered.
	 */
	function registerCustomStore( reducerKey, store ) {
		const { globalListener, namespaces } = registry._internals;
		const existingStoreKey = findKey( namespaces, value => value.store === store );

		namespaces[ reducerKey ] = { store };

		if ( ! existingStoreKey ) {
			// Customize subscribe behavior to call listeners only on effective change,
			// not on every dispatch.
			let lastState = store.getState();
			store.subscribe( () => {
				const state = store.getState();
				const hasChanged = state !== lastState;
				lastState = state;

				if ( hasChanged ) {
					globalListener();
				}
			} );
		}

		return store;
	}

	/**
	 * Registers a store within the registry.
	 *
	 * @param {String} reducerKey The desired key to denote this store.
	 * @param {Object} options Options for store, such as actions, selectors.
	 * @param {Object} [customStore] Optional custom store to use instead of creating one.
	 * @return {Object} The newly registered store.
	 */
	function registerStore( reducerKey, options, customStore ) {
		if ( customStore ) {
			const store = registerCustomStore( reducerKey, customStore );

			if ( options.actions ) {
				registry.registerActions( reducerKey, options.actions );
			}

			if ( options.selectors ) {
				registry.registerSelectors( reducerKey, options.selectors );
			}

			if ( options.resolvers ) {
				registry.registerResolvers( reducerKey, options.resolvers );
			}

			return store;
		}

		// No store given in options, pass through to normal operation.
		return registry.registerStore( reducerKey, options );
	}

	return {
		registerStore,
	};
}

export default customStorePlugin;
