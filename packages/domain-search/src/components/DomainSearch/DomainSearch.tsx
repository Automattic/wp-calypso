import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';

type DomainSearchContextType = {
	query: string;
	setQuery: ( query: string ) => void;
	onContinue: () => void;
};

export const DomainSearchContext = createContext< DomainSearchContextType >( {
	query: '',
	setQuery: () => {},
	onContinue: () => {},
} );

export const DomainSearch = ( {
	children,
	initialQuery,
	onContinue,
}: {
	children: React.ReactNode;
	initialQuery?: string;
	onContinue: () => void;
} ) => {
	const [ query, setQuery ] = useState( initialQuery ?? '' );

	useLayoutEffect( () => {
		setQuery( initialQuery ?? '' );
	}, [ initialQuery ] );

	const contextValue = useMemo(
		() => ( { query, setQuery, onContinue } ),
		[ query, setQuery, onContinue ]
	);

	return (
		<DomainSearchContext.Provider value={ contextValue }>{ children }</DomainSearchContext.Provider>
	);
};

export const useDomainSearch = () => {
	return useContext( DomainSearchContext );
};
