import { useMutation, useQuery } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import { DomainSearchSkipSuggestion } from '../../ui';

const SkipSuggestion = () => {
	const { cart, queries, query, currentSiteUrl, events } = useDomainSearch();

	const { data: suggestion } = useQuery( queries.freeSuggestion( query ) );

	const { mutate: addToCart, isPending: isAddingToCart } = useMutation( {
		mutationFn: ( suggestion: string ) => {
			// @ts-expect-error - Free domains have a different shape and will be addressed in a future PR.
			return cart.onAddItem( {
				domain_name: suggestion,
				cost: 'Free',
				product_slug: 'free_domain',
			} );
		},
	} );

	if ( currentSiteUrl ) {
		return (
			<DomainSearchSkipSuggestion
				existingSiteUrl={ currentSiteUrl }
				onSkip={ events.onContinue }
				disabled={ false }
				isBusy={ false }
			/>
		);
	}

	if ( suggestion ) {
		return (
			<DomainSearchSkipSuggestion
				freeSuggestion={ suggestion.domain_name }
				onSkip={ () => {
					addToCart( suggestion.domain_name );
				} }
				disabled={ isAddingToCart }
				isBusy={ isAddingToCart }
			/>
		);
	}

	return null;
};

SkipSuggestion.Placeholder = DomainSearchSkipSuggestion.Placeholder;

export { SkipSuggestion };
