import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import './style.scss';

interface SelectedDomain {
	domain: string;
	tld: string;
	originalPrice?: string;
	price: string;
}

interface Cart {
	items: SelectedDomain[];
	total: string;
	onAddItem: ( item: SelectedDomain ) => void;
	onRemoveItem: ( item: SelectedDomain ) => void;
}

type DomainSearchContextType = {
	query: string;
	setQuery: ( query: string ) => void;
	onContinue: () => void;
	cart: Cart;
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
};

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
	cart: Cart;
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

	return (
		<DomainSearchContext.Provider value={ contextValue }>
			<div className="domain-search">{ children }</div>
		</DomainSearchContext.Provider>
	);
};

export const useDomainSearch = () => {
	return useContext( DomainSearchContext );
};
