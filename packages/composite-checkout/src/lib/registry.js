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
