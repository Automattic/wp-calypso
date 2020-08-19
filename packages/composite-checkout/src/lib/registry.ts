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
import { useEffect } from 'react';

export { createRegistry, RegistryProvider, useRegistry, useDispatch, useSelect };

export const defaultRegistry = createRegistry();

export function registerStore< T = {} >( key: string, storeConfig: StoreConfig< T > ): void {
	defaultRegistry.registerStore( key, storeConfig );
}

export function useRegisterStore< T >( id: string, store: StoreConfig< T > ) {
	const registry = useRegistry();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect( () => registry.registerStore( id, store ), [] );
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
