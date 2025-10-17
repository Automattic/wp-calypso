import { createContext, useContext } from 'react';
import { useContainerQuery } from '../hooks/use-container-query';

export const useDomainSuggestionContainer = () => {
	const {
		ref: containerRef,
		activeQuery,
		currentWidth,
	} = useContainerQuery( {
		small: 0,
		large: 480,
	} );

	return { containerRef, activeQuery, currentWidth };
};

interface DomainSuggestionContainerContextValue {
	activeQuery: 'small' | 'large';
	currentWidth: number | null;
	priceAlignment?: 'left' | 'right';
	priceSize?: number;
	isFeatured?: boolean;
}

export const DomainSuggestionContainerContext = createContext<
	DomainSuggestionContainerContextValue | undefined
>( undefined );

export const useDomainSuggestionContainerContext = () =>
	useContext( DomainSuggestionContainerContext );
