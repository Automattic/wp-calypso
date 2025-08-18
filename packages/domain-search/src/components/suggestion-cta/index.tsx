import { useIsMutating, useMutation } from '@tanstack/react-query';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
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
	const {
		mutate: addToCart,
		isPending,
		error,
		submittedAt,
	} = useMutation( {
		mutationFn: () => cart.onAddItem( suggestion ),
	} );

	const isMutating = !! useIsMutating();
	const isCurrentMutation = useIsCurrentMutation( submittedAt );

	const isDomainOnCart = cart.hasItem( suggestion.domain_name );

	if ( isDomainOnCart ) {
		return <DomainSuggestionContinueCTA disabled={ isMutating } onClick={ events.onContinue } />;
	}

	const errorMessage = isCurrentMutation ? error?.message : null;

	if ( errorMessage ) {
		return <DomainSuggestionErrorCTA errorMessage={ errorMessage } callback={ addToCart } />;
	}

	return (
		<DomainSuggestionPrimaryCTA
			disabled={ isMutating }
			onClick={ addToCart }
			isBusy={ isPending }
		/>
	);
};
