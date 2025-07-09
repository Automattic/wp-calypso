import { Card } from '@wordpress/components';
import { createContext, useContext, useMemo } from 'react';
import { useContainerQuery } from '../../hooks/use-container-query';

const DomainSuggestionListContext = createContext( {
	activeQuery: 'small' as 'small' | 'large',
} );

export const DomainsSuggestionsList = ( { children }: { children: React.ReactNode } ) => {
	const { ref: containerRef, activeQuery } = useContainerQuery( {
		small: 480,
		large: 1024,
	} );

	const contextValue = useMemo( () => ( { activeQuery } ), [ activeQuery ] );

	return (
		<Card ref={ containerRef }>
			<DomainSuggestionListContext.Provider value={ contextValue }>
				{ children }
			</DomainSuggestionListContext.Provider>
		</Card>
	);
};

export const useDomainSuggestionsListContext = () => useContext( DomainSuggestionListContext );
