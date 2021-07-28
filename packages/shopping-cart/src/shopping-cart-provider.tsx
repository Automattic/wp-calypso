import debugFactory from 'debug';
import React from 'react';
import ShoppingCartContext from './shopping-cart-context';
import ShoppingCartOptionsContext from './shopping-cart-options-context';
import type { ShoppingCartManagerOptions, ShoppingCartManagerClient } from './types';

const debug = debugFactory( 'shopping-cart:shopping-cart-provider' );

export default function ShoppingCartProvider( {
	managerClient,
	options,
	children,
}: {
	managerClient: ShoppingCartManagerClient;
	options?: ShoppingCartManagerOptions;
	children: React.ReactNode;
} ): JSX.Element {
	if ( ! options ) {
		options = {};
	}
	debug( 'rendering ShoppingCartProvider with options', options );

	return (
		<ShoppingCartOptionsContext.Provider value={ options }>
			<ShoppingCartContext.Provider value={ managerClient }>
				{ children }
			</ShoppingCartContext.Provider>
		</ShoppingCartOptionsContext.Provider>
	);
}
