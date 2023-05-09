import debugFactory from 'debug';
import { useMemo, PropsWithChildren } from 'react';
import ShoppingCartContext from './shopping-cart-context';
import ShoppingCartOptionsContext from './shopping-cart-options-context';
import type { ShoppingCartManagerOptions, ShoppingCartManagerClient } from './types';

const debug = debugFactory( 'shopping-cart:shopping-cart-provider' );

export default function ShoppingCartProvider( {
	managerClient,
	options,
	children,
}: PropsWithChildren< {
	managerClient: ShoppingCartManagerClient;
	options?: ShoppingCartManagerOptions;
} > ) {
	if ( ! options ) {
		options = {};
	}
	debug( 'rendering ShoppingCartProvider with options', options );

	// Memoize a copy of the options object to prevent re-renders if the values
	// did not change.
	const { refetchOnWindowFocus, defaultCartKey } = options;
	const memoizedOptions = useMemo(
		() => ( {
			refetchOnWindowFocus,
			defaultCartKey,
		} ),
		[ refetchOnWindowFocus, defaultCartKey ]
	);

	return (
		<ShoppingCartOptionsContext.Provider value={ memoizedOptions }>
			<ShoppingCartContext.Provider value={ managerClient }>
				{ children }
			</ShoppingCartContext.Provider>
		</ShoppingCartOptionsContext.Provider>
	);
}
