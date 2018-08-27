/** @format */

/**
 * External dependencies
 */
import { mapValues, without } from 'lodash';

const calypsoRegistryPlugin = calypsoStore => registry => {
	const namespaces = {};
	let listeners = [];
	let lastCalypsoState = calypsoStore.getState();

	function calypsoListener() {
		listeners.forEach( listener => listener() );
	}

	calypsoStore.subscribe( () => {
		const calypsoState = calypsoStore.getState();
		const hasChanged = calypsoState !== lastCalypsoState;

		if ( hasChanged ) {
			lastCalypsoState = calypsoState;
			calypsoListener();
		}
	} );

	function registerToCalypsoStore( reducerKey, options ) {
		namespaces[ reducerKey ] = {};

		if ( options.selectors ) {
			registerCalypsoSelectors( reducerKey, options.selectors );
		}
		if ( options.actions ) {
			registerCalypsoActions( reducerKey, options.actions );
		}
	}

	function registerCalypsoSelectors( reducerKey, newSelectors ) {
		const createStateSelector = selector => ( ...args ) =>
			selector( calypsoStore.getState(), ...args );
		namespaces[ reducerKey ].selectors = mapValues( newSelectors, createStateSelector );
	}

	function registerCalypsoActions( reducerKey, newActions ) {
		const createBoundAction = action => ( ...args ) => calypsoStore.dispatch( action( ...args ) );
		namespaces[ reducerKey ].actions = mapValues( newActions, createBoundAction );
	}

	/**
	 * Registers a store within the registry.
	 * @param {String} reducerKey The desired key to denote this store.
	 * @param {Object} options The options for the store.
	 * @return {Object} The newly registered store.
	 */
	function registerStore( reducerKey, options ) {
		if ( options.useCalypsoStore ) {
			return registerToCalypsoStore( reducerKey, options );
		}

		// No store given in options, pass through to normal operation.
		return registry.registerStore( reducerKey, options );
	}

	/**
	 * Subscribe to registry change events.
	 * This subscribes to all store updates in the registry,
	 * calypso and otherwise.
	 * @param {Function} listener The listener function to be added.
	 * @returns {Function} The unsubscribe function for this listener.
	 */
	function subscribe( listener ) {
		listeners.push( listener );
		const registryUnsub = registry.subscribe( listener );

		return () => {
			listeners = without( listeners, listener );
			registryUnsub();
		};
	}

	/**
	 * Gets selectors for a desired store.
	 * @param {String} reducerKey The reducerKey for the desired store.
	 * @return {Object} A mapping of selectors for the desired store.
	 */
	function select( reducerKey ) {
		const namespace = namespaces[ reducerKey ];
		if ( namespace ) {
			return namespace.selectors;
		}
		return registry.select( reducerKey );
	}

	/**
	 * Gets action creators for a desired store.
	 * @param {String} reducerKey The reducerKey for the desired store.
	 * @return {Object} Action creators mapped to dispatch for the desired store.
	 */
	function dispatch( reducerKey ) {
		const namespace = namespaces[ reducerKey ];
		if ( namespace ) {
			return namespace.actions;
		}
		return registry.dispatch( reducerKey );
	}

	return {
		dispatch,
		registerStore,
		select,
		subscribe,
	};
};

export default calypsoRegistryPlugin;
