/** @format */
/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso-wp-data:combined-store-plugin' );

/**
 * Creates a plugin that supports a shared, combined, dynamic redux store.
 *
 * IMPORTANT: This plugin depends on the `custom-store-registry` to work.
 *            It must be given a registry already using that plugin.
 *
 * @param {Object} registry The original registry to wrap (already using `internals-plugin`).
 * @return {Object} An registry enhanced with dynamic store capabilities.
 */
function combinedStorePlugin( registry ) {
	function registerParentStore( reducerKey, options, customStore ) {
		debug(
			`Registering parent store ${ reducerKey } ` +
				` with reducers: ${ Object.keys( options.reducers ) }`
		);

		registry.registerStore( reducerKey, options, customStore );
		const parent = registry._internals.namespaces[ reducerKey ];
		parent.reducers = options.reducers;
		parent.store.replaceReducer( combineReducers( options.reducers ) );
		return parent.store;
	}

	function registerChildStore( reducerKey, options ) {
		debug(
			`Registering child store ${ reducerKey } ` +
				` with reducers: ${ Object.keys( options.reducers ) }`
		);

		if ( ! options.parent ) {
			throw new TypeError( 'Must specify parent reducerKey' );
		}
		if ( ! options.reducers ) {
			throw new TypeError( 'Must specify reducers' );
		}

		const parent = registry._internals.namespaces[ options.parent ];
		const collisions = Object.keys( options.reducers ).filter( key =>
			Object.keys( parent.reducers ).includes( key )
		);

		if ( collisions.length > 0 ) {
			throw new TypeError( `Reducer key collisions: ${ collisions }` );
		}

		registry.registerStore( reducerKey, options, parent.store );
		parent.reducers = { ...parent.reducers, ...options.reducers };
		parent.store.replaceReducer( combineReducers( parent.reducers ) );
		return parent.store;
	}

	return {
		registerChildStore,
		registerParentStore,
	};
}

export default combinedStorePlugin;
