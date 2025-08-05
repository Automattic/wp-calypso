import { createContext, useContext } from 'react';
import { useContainerQuery } from '../hooks/use-container-query';

export const useDomainSuggestionContainer = () => {
	const { ref: containerRef, activeQuery } = useContainerQuery( {
		small: 0,
		large: 480,
	} );

	return { containerRef, activeQuery };
};

interface DomainSuggestionContainerContextValue {
	activeQuery: 'small' | 'large';
	priceAlignment?: 'left' | 'right';
	priceSize?: number;
	isFeatured?: boolean;
}

export const DomainSuggestionContainerContext = createContext<
	DomainSuggestionContainerContextValue | undefined
>( undefined );

export const useDomainSuggestionContainerContext = () =>
	useContext( DomainSuggestionContainerContext );
