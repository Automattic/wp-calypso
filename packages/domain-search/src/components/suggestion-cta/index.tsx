import { useDomainSearch } from '../../page/context';
import {
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrimaryCTA,
} from '../../ui';
import { type DomainSuggestion } from '../search-results/types';

export interface DomainSuggestionCTAProps {
	suggestion: DomainSuggestion;
}

export const DomainSuggestionCTA = ( { suggestion }: DomainSuggestionCTAProps ) => {
	const { cart, events } = useDomainSearch();
	const isCartBusy = false;

	const isDomainOnCart = cart.hasItem( suggestion.domain_name );

	if ( isDomainOnCart ) {
		return <DomainSuggestionContinueCTA disabled={ isCartBusy } onClick={ events.onContinue } />;
	}

	const errorMessage = null;

	if ( errorMessage ) {
		return <DomainSuggestionErrorCTA errorMessage={ errorMessage } callback={ () => {} } />;
	}

	return (
		<DomainSuggestionPrimaryCTA
			disabled={ isCartBusy }
			onClick={ () => {} }
			isBusy={ isCartBusy }
		/>
	);
};
