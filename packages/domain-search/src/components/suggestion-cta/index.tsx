import { useDomainSearch } from '../../page/context';
import {
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrimaryCTA,
} from '../../ui';

export interface DomainSuggestionCTAProps {
	domain: string;
}

export const DomainSuggestionCTA = ( { domain }: DomainSuggestionCTAProps ) => {
	const { cart, onContinue } = useDomainSearch();

	const addToCart = () => {
		cart.onAddItem( domain );
	};

	const isDomainOnCart = cart.hasItem( domain );

	if ( isDomainOnCart ) {
		return <DomainSuggestionContinueCTA onClick={ onContinue } />;
	}

	const errorMessage = null;

	if ( errorMessage ) {
		return <DomainSuggestionErrorCTA errorMessage={ errorMessage } callback={ addToCart } />;
	}

	return <DomainSuggestionPrimaryCTA onClick={ addToCart } />;
};
