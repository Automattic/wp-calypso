import { ResponseCartProduct } from '@automattic/shopping-cart';
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface RestorableProductsContextType {
	restorableProducts: ResponseCartProduct[];
	setRestorableProducts: Dispatch< SetStateAction< ResponseCartProduct[] > >;
}

const RestorableProductsContext = createContext< RestorableProductsContextType | undefined >(
	undefined
);

export const RestorableProductsProvider = ( { children }: { children: ReactNode } ) => {
	const [ restorableProducts, setRestorableProducts ] = useState< ResponseCartProduct[] >( [] );
	return (
		<RestorableProductsContext.Provider value={ { restorableProducts, setRestorableProducts } }>
			{ children }
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
