/**
 * External dependencies
 */
import {
	createRegistry,
	RegistryProvider,
	useRegistry,
	useDispatch,
	useSelect,
} from '@wordpress/data';

import useConstructor from './use-constructor';

export { createRegistry, RegistryProvider, useRegistry, useDispatch, useSelect };

export const defaultRegistry = createRegistry();

export function registerStore( ...args ) {
	return defaultRegistry.registerStore( ...args );
}

export function useRegisterStore( id, store ) {
	const registry = useRegistry();
	useConstructor( () => registry.registerStore( id, store ) );
}

const primaryStoreId = 'checkout';

export function useRegisterPrimaryStore( store ) {
	return useRegisterStore( primaryStoreId, store );
}

export function usePrimarySelect( callback ) {
	return useSelect( ( select ) => callback( select.bind( null, primaryStoreId ) ) );
}

export function usePrimaryDispatch() {
	return useDispatch( primaryStoreId );
}
