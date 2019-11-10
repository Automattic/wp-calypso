/**
 * External dependencies
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export function createRegistry() {
	let state = {};
	const stores = {};
	let listeners = [];

	const setState = newState => {
		state = newState;
		listeners.forEach( listener => listener() );
	};

	return {
		registerStore( storeId, store ) {
			store = normalizeStore( storeId, store );
			stores[ storeId ] = store;
			state = { ...state, [ storeId ]: store.reducer( undefined, { type: 'INIT' } ) };
		},

		subscribe( listener ) {
			listeners.push( listener );
			return () => {
				listeners = listeners.filter( callback => callback !== listener );
			};
		},

		select( storeId ) {
			if ( ! stores[ storeId ] ) {
				throw new Error( `No store found for id '${ storeId }'` );
			}
			const { selectors } = stores[ storeId ];
			return Object.keys( selectors ).reduce( ( boundSelectors, key ) => {
				boundSelectors[ key ] = ( ...args ) =>
					handleSelector( { args, selector: selectors[ key ], state: state[ storeId ] } );
				return boundSelectors;
			}, {} );
		},

		dispatch( storeId ) {
			if ( ! stores[ storeId ] ) {
				throw new Error( `No store found for id '${ storeId }'` );
			}
			const { actions, reducer, controls } = stores[ storeId ];
			return Object.keys( actions ).reduce( ( boundActions, key ) => {
				boundActions[ key ] = ( ...args ) =>
					handleAction( { args, actions, key, storeId, reducer, state, setState, controls } );
				return boundActions;
			}, {} );
		},
	};
}

function normalizeStore( storeId, store ) {
	const { reducer = state => state, actions = {}, controls = {}, selectors = {} } = store;
	return {
		reducer,
		actions,
		controls,
		selectors,
	};
}

function handleSelector( { args, selector, state } ) {
	return selector( state, ...args );
}

async function handleAction( { args, actions, key, storeId, reducer, state, setState, controls } ) {
	let action = actions[ key ]( ...args );
	if ( action.next ) {
		action = await handleGeneratorAction( action, storeId, controls );
	}
	console.log( 'action', action ); // eslint-disable-line no-console
	const newState = { ...state, [ storeId ]: reducer( state[ storeId ], action ) };
	console.log( 'newState', newState ); // eslint-disable-line no-console
	if ( state !== newState ) {
		setState( newState );
	}
}

async function handleGeneratorAction( action, storeId, controls ) {
	let current = action.next();
	while ( ! current.done ) {
		const asyncAction = current.value;
		console.log( 'async action', asyncAction ); // eslint-disable-line no-console
		if ( ! controls[ asyncAction.type ] ) {
			throw new Error( `No control found for key '${ asyncAction.type }' in store '${ storeId }'` );
		}
		const result = await controls[ asyncAction.type ]( asyncAction );
		current = action.next( result );
	}
	return current.value;
}

export const { registerStore, subscribe, select, dispatch } = createRegistry();

const RegistryContext = createContext();

export function RegistryProvider( { registry, children } ) {
	if ( ! registry ) {
		registry = { select, dispatch, registerStore, subscribe };
	}
	return <RegistryContext.Provider value={ registry }>{ children }</RegistryContext.Provider>;
}

export function useRegistry() {
	const registry = useContext( RegistryContext );
	if ( ! registry ) {
		throw new Error( 'useRegistry can only be used inside a CheckoutProvider' );
	}
	return registry;
}

export function useSelect( mapFunc, deps = [] ) {
	const registry = useRegistry();
	const [ state, setState ] = useState( mapFunc( registry.select ) );
	const [ currentAttempt, setAttempt ] = useState( 1 );
	const memoizedMapFunc = useCallback( mapFunc, deps );
	useEffect( () => {
		const newState = memoizedMapFunc( registry.select );
		setState( newState );
	}, [ memoizedMapFunc, currentAttempt, registry.select ] );
	useEffect( () => {
		let isActive = true;
		const unsubscribe = registry.subscribe(
			() => isActive && setAttempt( current => current + 1 )
		);
		return () => {
			isActive = false;
			unsubscribe();
		};
	}, [ registry ] );
	return state;
}

export function useDispatch( storeId ) {
	const registry = useRegistry();
	const [ state, setState ] = useState( registry.dispatch( storeId ) );
	const [ currentAttempt, setAttempt ] = useState( 1 );
	useEffect( () => {
		setState( registry.dispatch( storeId ) );
	}, [ storeId, currentAttempt, registry ] );
	useEffect( () => {
		let isActive = true;
		const unsubscribe = registry.subscribe(
			() => isActive && setAttempt( current => current + 1 )
		);
		return () => {
			isActive = false;
			unsubscribe();
		};
	}, [ registry ] );
	return state;
}
