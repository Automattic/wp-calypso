import { FilterState } from '@automattic/domain-search/src/components/search-bar/types';
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
	filter: {
		exactSldMatchesOnly: false,
		tlds: [],
	},
	setFilter: () => {},
} );

export const DomainSearch = ( {
	children,
	onContinue,
	cart,
	className,
	setFilter,
	filter,
}: {
	children: React.ReactNode;
	onContinue: () => void;
	cart: DomainSearchCart;
	className?: string;
	setFilter: ( filter: FilterState ) => void;
	filter: FilterState;
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
			filter,
			setFilter,
		} ),
		[ onContinue, cart, closeFullCart, openFullCart, isFullCartOpen, filter, setFilter ]
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
