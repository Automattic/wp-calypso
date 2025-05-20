import { ResponseCartProduct } from '@automattic/shopping-cart';
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

type RestorableProductsContextType = [
	restorableProducts: ResponseCartProduct[],
	setRestorableProducts: Dispatch< SetStateAction< ResponseCartProduct[] > >,
];

const RestorableProductsContext = createContext< RestorableProductsContextType | undefined >(
	undefined
);

// This context is used to store the order of products in the cart, so we can render the
// restorable items in the same place as the original items in the cart.
type CartProductsOrderContextType = [
	cartProductsOrder: ResponseCartProduct[ 'product_id' ][],
	setCartProductsOrder: Dispatch< SetStateAction< ResponseCartProduct[ 'product_id' ][] > >,
];

const CartProductsOrderContext = createContext< CartProductsOrderContextType | undefined >(
	undefined
);

export const RestorableProductsProvider = ( { children }: { children: ReactNode } ) => {
	const state = useState< ResponseCartProduct[] >( [] );
	const productsOrderState = useState< ResponseCartProduct[ 'product_id' ][] >( [] );

	return (
		<RestorableProductsContext.Provider value={ state }>
			<CartProductsOrderContext.Provider value={ productsOrderState }>
				{ children }
			</CartProductsOrderContext.Provider>
		</RestorableProductsContext.Provider>
	);
};

export const useRestorableProducts = () => {
	const context = useContext( RestorableProductsContext );
	if ( ! context ) {
		throw new Error( 'useRestorableProducts must be used within a RestorableProductsProvider' );
	}
	return context;
};

export const useCartProductsOrder = () => {
	const context = useContext( CartProductsOrderContext );
	if ( ! context ) {
		throw new Error( 'useCartProductsOrder must be used within a RestorableProductsProvider' );
	}
	return context;
};
