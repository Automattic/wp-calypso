import { useContext } from 'react';
import ShoppingCartContext from './shopping-cart-context';
import { ShoppingCartManagerClient } from './types';

export default function useManagerClient( containerName: string ): ShoppingCartManagerClient {
	const managerClient = useContext( ShoppingCartContext );
	if ( ! managerClient ) {
		throw new Error( `${ containerName } must be used inside a ShoppingCartProvider` );
	}
	return managerClient;
}
