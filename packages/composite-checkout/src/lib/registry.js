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

export function useRegisterStore( id, store ) {
	const { registerStore } = useRegistry();
	useConstructor( () => registerStore( id, store ) );
}

const primaryStoreId = 'checkout';

export function useRegisterPrimaryStore( store ) {
	return useRegisterStore( primaryStoreId, store );
}

export function usePrimarySelect( callback ) {
	return useSelect( select => callback( select.bind( null, primaryStoreId ) ) );
}

export function usePrimaryDispatch() {
	return useDispatch( primaryStoreId );
}
