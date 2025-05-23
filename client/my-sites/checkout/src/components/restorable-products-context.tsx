import { ResponseCartProduct } from '@automattic/shopping-cart';
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

type RestorableProductsContextType = [
	restorableProducts: ResponseCartProduct[],
	setRestorableProducts: Dispatch< SetStateAction< ResponseCartProduct[] > >,
];

const RestorableProductsContext = createContext< RestorableProductsContextType | undefined >(
	undefined
);

interface ProductOrderInfo {
	position: number;
	removed: boolean;
}

// This context is used to store the order of products in the cart, so we can render the
// restorable items in the same place as the original items in the cart.
type CartProductsOrderContextType = [
	cartProductsOrder: Map< ResponseCartProduct[ 'uuid' ], ProductOrderInfo >,
	setCartProductsOrder: Dispatch<
		SetStateAction< Map< ResponseCartProduct[ 'uuid' ], ProductOrderInfo > >
	>,
];

const CartProductsOrderContext = createContext< CartProductsOrderContextType | undefined >(
	undefined
);

export const RestorableProductsProvider = ( { children }: { children: ReactNode } ) => {
	const state = useState< ResponseCartProduct[] >( [] );
	const productsOrderState = useState< Map< ResponseCartProduct[ 'uuid' ], ProductOrderInfo > >(
		new Map()
	);

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
