/**
 * External dependencies
 */
import {
	createRegistry,
	RegistryProvider,
	useRegistry,
	useDispatch,
	useSelect,
	StoreConfig,
	SelectorMap,
} from '@wordpress/data';
import { useRef } from 'react';
import debugFactory from 'debug';

const debug = debugFactory( 'composite-checkout:registry' );

export { createRegistry, RegistryProvider, useRegistry, useDispatch, useSelect };

export const defaultRegistry = createRegistry();

export function registerStore< T = {} >( key: string, storeConfig: StoreConfig< T > ) {
	return defaultRegistry.registerStore( key, storeConfig );
}

export function useRegisterStore< T >( id: string, store: StoreConfig< T > ) {
	const registry = useRegistry();
	const hasRegistered = useRef( false );
	if ( ! hasRegistered.current ) {
		debug( 'registering store', id );
		registry.registerStore( id, store );
		hasRegistered.current = true;
	}
}

const primaryStoreId = 'checkout';

export function useRegisterPrimaryStore< T >( store: StoreConfig< T > ) {
	return useRegisterStore( primaryStoreId, store );
}

export function usePrimarySelect< T >( mapSelect: ( s: ( key: string ) => SelectorMap ) => T ): T {
	return useSelect( ( select ) => mapSelect( select.bind( null, primaryStoreId ) ) );
}

export function usePrimaryDispatch() {
	return useDispatch( primaryStoreId );
}
