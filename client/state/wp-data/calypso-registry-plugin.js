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
			registerSelectors( reducerKey, options.selectors );
		}
	}

	function registerSelectors( reducerKey, newSelectors ) {
		const createStateSelector = selector => ( ...args ) =>
			selector( calypsoStore.getState(), ...args );
		namespaces[ reducerKey ].selectors = mapValues( newSelectors, createStateSelector );
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

	return {
		registerStore,
		select,
		subscribe,
	};
};

export default calypsoRegistryPlugin;
