import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useContainerQuery } from '../../hooks/use-container-query';

interface FeaturedDomainSuggestionsListProps {
	children: React.ReactNode;
}

export const FeaturedDomainSuggestionsList = ( {
	children,
}: FeaturedDomainSuggestionsListProps ) => {
	const { ref, activeQuery } = useContainerQuery( {
		small: 0,
		large: 600,
	} );

	const Element = activeQuery === 'large' ? HStack : VStack;

	return (
		<Element ref={ ref } spacing={ 4 } role="list">
			{ children }
		</Element>
	);
};
