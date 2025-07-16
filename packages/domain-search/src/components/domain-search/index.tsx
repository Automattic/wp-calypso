import clsx from 'clsx';
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import type { DomainSearchCart, DomainSearchContextType } from './types';

import './style.scss';

export const DomainSearchContext = createContext< DomainSearchContextType >( {
	query: '',
	setQuery: () => {},
	onContinue: () => {},
	cart: {
		items: [],
		total: '',
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
	initialQuery,
	onContinue,
	cart,
	className,
}: {
	children: React.ReactNode;
	initialQuery?: string;
	onContinue: () => void;
	cart: DomainSearchCart;
	className?: string;
} ) => {
	const [ query, setQuery ] = useState( initialQuery ?? '' );
	const [ isFullCartOpen, setIsFullCartOpen ] = useState( false );

	useLayoutEffect( () => {
		setQuery( initialQuery ?? '' );
	}, [ initialQuery ] );

	const closeFullCart = useCallback( () => {
		setIsFullCartOpen( false );
	}, [] );

	const openFullCart = useCallback( () => {
		setIsFullCartOpen( true );
	}, [] );

	const contextValue = useMemo(
		() => ( {
			query,
			setQuery,
			onContinue,
			cart,
			closeFullCart,
			openFullCart,
			isFullCartOpen,
		} ),
		[ query, setQuery, onContinue, cart, closeFullCart, openFullCart, isFullCartOpen ]
	);

	const cartItemsLength = cart.items.length;

	useLayoutEffect( () => {
		if ( cartItemsLength === 0 && isFullCartOpen ) {
			closeFullCart();
		}
	}, [ cartItemsLength, isFullCartOpen, closeFullCart ] );

	return (
		<DomainSearchContext.Provider value={ contextValue }>
			<div className={ clsx( 'domain-search', className ) }>{ children }</div>
		</DomainSearchContext.Provider>
	);
};

export const useDomainSearch = () => {
	return useContext( DomainSearchContext );
};
