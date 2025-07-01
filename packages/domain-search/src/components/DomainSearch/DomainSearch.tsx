import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';

interface SelectedDomain {
	domain: string;
	tld: string;
	originalPrice?: string;
	price: string;
}

type DomainSearchContextType = {
	query: string;
	setQuery: ( query: string ) => void;
	onContinue: () => void;
	selectedDomains: SelectedDomain[];
	isFullCartOpen: boolean;
	closeFullCart: () => void;
	openFullCart: () => void;
};

export const DomainSearchContext = createContext< DomainSearchContextType >( {
	query: '',
	setQuery: () => {},
	onContinue: () => {},
	selectedDomains: [],
	isFullCartOpen: false,
	closeFullCart: () => {},
	openFullCart: () => {},
} );

export const DomainSearch = ( {
	children,
	initialQuery,
	onContinue,
	selectedDomains,
}: {
	children: React.ReactNode;
	initialQuery?: string;
	onContinue: () => void;
	selectedDomains: SelectedDomain[];
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
			selectedDomains,
			closeFullCart,
			openFullCart,
			isFullCartOpen,
		} ),
		[ query, setQuery, onContinue, selectedDomains, closeFullCart, openFullCart, isFullCartOpen ]
	);

	return (
		<DomainSearchContext.Provider value={ contextValue }>{ children }</DomainSearchContext.Provider>
	);
};

export const useDomainSearch = () => {
	return useContext( DomainSearchContext );
};
