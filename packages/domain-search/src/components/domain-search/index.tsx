import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import './style.scss';

export interface SelectedDomain {
	uuid: string;
	domain: string;
	tld: string;
	originalPrice?: string;
	price: string;
}

export interface DomainSearchCart {
	items: SelectedDomain[];
	total: string;
	onAddItem: ( item: SelectedDomain ) => void;
	onRemoveItem: ( item: SelectedDomain ) => void;
}

export interface DomainSearchContextType {
	query: string;
	setQuery: ( query: string ) => void;
	onContinue: () => void;
	cart: DomainSearchCart;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
}

export const DomainSearchContext = createContext< DomainSearchContextType >( {
	query: '',
	setQuery: () => {},
	onContinue: () => {},
	cart: {
		items: [],
		total: '',
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
}: {
	children: React.ReactNode;
	initialQuery?: string;
	onContinue: () => void;
	cart: DomainSearchCart;
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
			<div className="domain-search">{ children }</div>
		</DomainSearchContext.Provider>
	);
};

export const useDomainSearch = () => {
	return useContext( DomainSearchContext );
};
