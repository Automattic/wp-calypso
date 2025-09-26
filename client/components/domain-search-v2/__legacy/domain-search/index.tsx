import clsx from 'clsx';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import type { DomainSearchCart, DomainSearchContextType } from './types';

import './style.scss';

export const DomainSearchContext = createContext< DomainSearchContextType >( {
	onContinue: () => {},
	cart: {
		items: [],
		total: '',
		isBusy: false,
		errorMessage: null,
		hasItem: () => false,
		onAddItem: () => {},
		onRemoveItem: () => {},
	},
	isFullCartOpen: false,
	closeFullCart: () => {},
	openFullCart: () => {},
} );

export const DomainSearch = ( {
	children,
	onContinue,
	cart,
	className,
}: {
	children: React.ReactNode;
	onContinue: () => void;
	cart: DomainSearchCart;
	className?: string;
} ) => {
	const [ isFullCartOpen, setIsFullCartOpen ] = useState( false );

	const closeFullCart = useCallback( () => {
		setIsFullCartOpen( false );
	}, [] );

	const openFullCart = useCallback( () => {
		setIsFullCartOpen( true );
	}, [] );

	const contextValue = useMemo(
		() => ( {
			onContinue,
			cart,
			closeFullCart,
			openFullCart,
			isFullCartOpen,
		} ),
		[ onContinue, cart, closeFullCart, openFullCart, isFullCartOpen ]
	);

	const cartItemsLength = cart.items.length;

	useLayoutEffect( () => {
		if ( cartItemsLength === 0 && isFullCartOpen ) {
			closeFullCart();
		}
	}, [ cartItemsLength, isFullCartOpen, closeFullCart ] );

	return (
		<DomainSearchContext.Provider value={ contextValue }>
			<div className={ clsx( 'domain-search-legacy', className ) }>{ children }</div>
		</DomainSearchContext.Provider>
	);
};

export const useDomainSearch = () => {
	return useContext( DomainSearchContext );
};
