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
		lastCalypsoState = calypsoState;

		if ( hasChanged ) {
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

	function registerStore( reducerKey, options ) {
		if ( options.useCalypsoStore ) {
			return registerToCalypsoStore( reducerKey, options );
		}

		// No store given in options, pass through to normal operation.
		return registry.registerStore( reducerKey, options );
	}

	function subscribe( listener ) {
		listeners.push( listener );
		const registryUnsub = registry.subscribe( listener );

		return () => {
			listeners = without( listeners, listener );
			registryUnsub();
		};
	}

	function select( reducerKey ) {
		const namespace = namespaces[ reducerKey ];
		if ( namespace ) {
			return namespace.selectors;
		}
		return registry.select( reducerKey );
	}

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
