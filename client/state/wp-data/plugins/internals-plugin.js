/** @format */

/**
 * External dependencies
 */
import { createStore } from 'redux';
import { get, flowRight, mapValues, overEvery, without } from 'lodash';

/**
 * An isolated orchestrator of store registrations.
 *
 * @typedef {WPDataRegistry}
 *
 * @property {Function} registerReducer
 * @property {Function} registerSelectors
 * @property {Function} registerResolvers
 * @property {Function} registerActions
 * @property {Function} registerStore
 * @property {Function} subscribe
 * @property {Function} select
 * @property {Function} dispatch
 * @property {Function} use
 */

/**
 * An object of registry function overrides.
 *
 * @typedef {WPDataPlugin}
 */

/**
 * A copy of the builtin @wordpress/data registry with internal access for plugins.
 *
 * NOTE: This plugin was created to prevent the hassle of reinvinting all of the
 * registry with each plugin. Here it can be done once and exposed for other
 * plugins.
 *
 * This is exactly the same code as the original registry but gives access to
 * registry internals, including:
 *  - namespaces (object mapping of reducerKey to options)
 *  - listeners (added via subscribe)
 *  - globalListener (to be called by stores)
 *  - isActionLike
 *  - isAsyncIterable
 *  - isIterable
 *  - toAsyncIterable
 *
 * TODO: Submit a PR to Gutenberg with an updated `use` function patterned off of this plugin.
 *
 * @return {Object} The registry updates, which override all functionality
 *                  with an exact copy of the default registry implementation.
 * 					(Except the `use` function which is modified.)
 */
function internalsPlugin() {
	const namespaces = {};
	let listeners = [];

	/**
	 * Global listener called for each store's update.
	 */
	function globalListener() {
		listeners.forEach( listener => listener() );
	}

	/**
	 * Registers a new sub-reducer to the global state and returns a Redux-like
	 * store object.
	 *
	 * @param {string} reducerKey Reducer key.
	 * @param {Object} reducer    Reducer function.
	 *
	 * @return {Object} Store Object.
	 */
	function registerReducer( reducerKey, reducer ) {
		const enhancers = [];
		if ( typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__ ) {
			enhancers.push(
				window.__REDUX_DEVTOOLS_EXTENSION__( { name: reducerKey, instanceId: reducerKey } )
			);
		}
		const store = createStore( reducer, flowRight( enhancers ) );
		namespaces[ reducerKey ] = { store, reducer };

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

		return store;
	}

	/**
	 * Registers selectors for external usage.
	 *
	 * @param {string} reducerKey   Part of the state shape to register the
	 *                              selectors for.
	 * @param {Object} newSelectors Selectors to register. Keys will be used as the
	 *                              public facing API. Selectors will get passed the
	 *                              state as first argument.
	 */
	function registerSelectors( reducerKey, newSelectors ) {
		const store = namespaces[ reducerKey ].store;
		const createStateSelector = selector => ( ...args ) => selector( store.getState(), ...args );
		namespaces[ reducerKey ].selectors = mapValues( newSelectors, createStateSelector );
	}

	/**
	 * Registers resolvers for a given reducer key. Resolvers are side effects
	 * invoked once per argument set of a given selector call, used in ensuring
	 * that the data needs for the selector are satisfied.
	 *
	 * @param {string} reducerKey   Part of the state shape to register the
	 *                              resolvers for.
	 * @param {Object} newResolvers Resolvers to register.
	 */
	function registerResolvers( reducerKey, newResolvers ) {
		const { hasStartedResolution } = select( 'core/data' );
		const { startResolution, finishResolution } = dispatch( 'core/data' );

		const createResolver = ( selector, selectorName ) => {
			// Don't modify selector behavior if no resolver exists.
			if ( ! newResolvers.hasOwnProperty( selectorName ) ) {
				return selector;
			}

			const store = namespaces[ reducerKey ].store;

			// Normalize resolver shape to object.
			let resolver = newResolvers[ selectorName ];
			if ( ! resolver.fulfill ) {
				resolver = { fulfill: resolver };
			}

			async function fulfill( ...args ) {
				if ( hasStartedResolution( reducerKey, selectorName, args ) ) {
					return;
				}

				startResolution( reducerKey, selectorName, args );

				// At this point, selectors have already been pre-bound to inject
				// state, it would not be otherwise provided to fulfill.
				const state = store.getState();

				let fulfillment = resolver.fulfill( state, ...args );

				// Attempt to normalize fulfillment as async iterable.
				fulfillment = toAsyncIterable( fulfillment );
				if ( ! isAsyncIterable( fulfillment ) ) {
					finishResolution( reducerKey, selectorName, args );
					return;
				}

				for await ( const maybeAction of fulfillment ) {
					// Dispatch if it quacks like an action.
					if ( isActionLike( maybeAction ) ) {
						store.dispatch( maybeAction );
					}
				}

				finishResolution( reducerKey, selectorName, args );
			}

			if ( typeof resolver.isFulfilled === 'function' ) {
				// When resolver provides its own fulfillment condition, fulfill
				// should only occur if not already fulfilled (opt-out condition).
				fulfill = overEvery( [
					( ...args ) => {
						const state = store.getState();
						return ! resolver.isFulfilled( state, ...args );
					},
					fulfill,
				] );
			}

			return ( ...args ) => {
				fulfill( ...args );
				return selector( ...args );
			};
		};

		namespaces[ reducerKey ].selectors = mapValues(
			namespaces[ reducerKey ].selectors,
			createResolver
		);
	}

	/**
	 * Registers actions for external usage.
	 *
	 * @param {string} reducerKey   Part of the state shape to register the
	 *                              selectors for.
	 * @param {Object} newActions   Actions to register.
	 */
	function registerActions( reducerKey, newActions ) {
		const store = namespaces[ reducerKey ].store;
		const createBoundAction = action => ( ...args ) => store.dispatch( action( ...args ) );
		namespaces[ reducerKey ].actions = mapValues( newActions, createBoundAction );
	}

	/**
	 * Convenience for registering reducer with actions and selectors.
	 *
	 * @param {string} reducerKey Reducer key.
	 * @param {Object} options    Store description (reducer, actions, selectors, resolvers).
	 *
	 * @return {Object} Registered store object.
	 */
	function registerStore( reducerKey, options ) {
		if ( ! options.reducer ) {
			throw new TypeError( 'Must specify store reducer' );
		}

		const store = registerReducer( reducerKey, options.reducer );

		if ( options.actions ) {
			registerActions( reducerKey, options.actions );
		}

		if ( options.selectors ) {
			registerSelectors( reducerKey, options.selectors );
		}

		if ( options.resolvers ) {
			registerResolvers( reducerKey, options.resolvers );
		}

		return store;
	}

	/**
	 * Subscribe to changes to any data.
	 *
	 * @param {Function}   listener Listener function.
	 *
	 * @return {Function}           Unsubscribe function.
	 */
	const subscribe = listener => {
		listeners.push( listener );

		return () => {
			listeners = without( listeners, listener );
		};
	};

	/**
	 * Calls a selector given the current state and extra arguments.
	 *
	 * @param {string} reducerKey Part of the state shape to register the
	 *                            selectors for.
	 *
	 * @return {*} The selector's returned value.
	 */
	function select( reducerKey ) {
		return get( namespaces, [ reducerKey, 'selectors' ] );
	}

	/**
	 * Returns the available actions for a part of the state.
	 *
	 * @param {string} reducerKey Part of the state shape to dispatch the
	 *                            action for.
	 *
	 * @return {*} The action's returned value.
	 */
	function dispatch( reducerKey ) {
		return get( namespaces, [ reducerKey, 'actions' ] );
	}

	const registry = {
		registerReducer,
		registerSelectors,
		registerResolvers,
		registerActions,
		registerStore,
		subscribe,
		select,
		dispatch,
		use,
	};

	/**
	 * Enhances the registry with the prescribed set of overrides. Returns the
	 * enhanced registry to enable plugin chaining.
	 *
	 * NOTE: This is the one function that is different than the original implementation.
	 * It grants access to the internals of the registry for plugins only, not for
	 * general external use.
	 *
	 * Also, this use function doesn't mutate the underlying registry variable like the
	 * original implementation does, returning a composed copy instead.
	 *
	 * @param {WPDataPlugin} plugin  Plugin by which to enhance.
	 * @param {?Object}      options Optional options to pass to plugin.
	 *
	 * @return {WPDataRegistry} Enhanced registry.
	 */
	function use( plugin, options ) {
		const registryWithInternals = {
			...registry,
			_internals: {
				namespaces,
				listeners,
				globalListener,
				isActionLike,
				isAsyncIterable,
				isIterable,
				toAsyncIterable,
			},
		};

		const updatedRegistry = {
			...registry,
			...plugin( registryWithInternals, options ),
		};

		// TODO: Add some warning output if _internals is there?
		return updatedRegistry;
	}

	return registry;
}

/**
 * Returns true if the given argument appears to be a dispatchable action.
 *
 * @param {*} action Object to test.
 *
 * @return {boolean} Whether object is action-like.
 */
export function isActionLike( action ) {
	return !! action && typeof action.type === 'string';
}

/**
 * Returns true if the given object is an async iterable, or false otherwise.
 *
 * @param {*} object Object to test.
 *
 * @return {boolean} Whether object is an async iterable.
 */
export function isAsyncIterable( object ) {
	return !! object && typeof object[ Symbol.asyncIterator ] === 'function';
}

/**
 * Returns true if the given object is iterable, or false otherwise.
 *
 * @param {*} object Object to test.
 *
 * @return {boolean} Whether object is iterable.
 */
export function isIterable( object ) {
	return !! object && typeof object[ Symbol.iterator ] === 'function';
}

/**
 * Normalizes the given object argument to an async iterable, asynchronously
 * yielding on a singular or array of generator yields or promise resolution.
 *
 * @param {*} object Object to normalize.
 *
 * @return {AsyncGenerator} Async iterable actions.
 */
export function toAsyncIterable( object ) {
	if ( isAsyncIterable( object ) ) {
		return object;
	}

	return ( async function*() {
		// Normalize as iterable...
		if ( ! isIterable( object ) ) {
			object = [ object ];
		}

		for ( const maybeAction of object ) {
			yield maybeAction;
		}
	} )();
}

export default internalsPlugin;
