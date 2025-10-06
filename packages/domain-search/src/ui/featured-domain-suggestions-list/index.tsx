import { Flex } from '@wordpress/components';
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

	return (
		<Flex
			ref={ ref }
			gap={ 4 }
			role="list"
			direction={ activeQuery === 'large' ? 'row' : 'column' }
		>
			{ children }
		</Flex>
	);
};
