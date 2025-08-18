import { useMutation } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import {
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrimaryCTA,
} from '../../ui';
import { DomainSuggestion } from '../search-results/queries';

export interface DomainSuggestionCTAProps {
	suggestion: DomainSuggestion;
}

export const DomainSuggestionCTA = ( { suggestion }: DomainSuggestionCTAProps ) => {
	const { cart, onContinue } = useDomainSearch();
	const { mutate: addToCart, isPending } = useMutation( {
		mutationFn: () => cart.onAddItem( suggestion ),
	} );

	const isDomainOnCart = cart.hasItem( suggestion.domain_name );

	if ( isDomainOnCart ) {
		return <DomainSuggestionContinueCTA onClick={ onContinue } />;
	}

	const errorMessage = null;

	if ( errorMessage ) {
		return <DomainSuggestionErrorCTA errorMessage={ errorMessage } callback={ addToCart } />;
	}

	return <DomainSuggestionPrimaryCTA onClick={ addToCart } isBusy={ isPending } />;
};
