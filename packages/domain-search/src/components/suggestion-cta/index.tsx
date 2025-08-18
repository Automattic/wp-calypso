import { useMutation } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion } from '../../queries/suggestions';
import {
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrimaryCTA,
} from '../../ui';

export interface DomainSuggestionCTAProps {
	suggestion: DomainSuggestion;
}

export const DomainSuggestionCTA = ( { suggestion }: DomainSuggestionCTAProps ) => {
	const { cart, events } = useDomainSearch();
	const { mutate: addToCart, isPending } = useMutation( {
		mutationFn: () => cart.onAddItem( suggestion ),
	} );

	const isDomainOnCart = cart.hasItem( suggestion.domain_name );

	if ( isDomainOnCart ) {
		return <DomainSuggestionContinueCTA onClick={ events.onContinue } />;
	}

	const errorMessage = null;

	if ( errorMessage ) {
		return <DomainSuggestionErrorCTA errorMessage={ errorMessage } callback={ addToCart } />;
	}

	return <DomainSuggestionPrimaryCTA onClick={ addToCart } isBusy={ isPending } />;
};
