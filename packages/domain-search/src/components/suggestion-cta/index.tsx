import { useDomainSearch } from '../../page/context';
import {
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrimaryCTA,
} from '../../ui';

export interface DomainSuggestionCTAProps {
	domainName: string;
}

export const DomainSuggestionCTA = ( { domainName }: DomainSuggestionCTAProps ) => {
	const { cart, events } = useDomainSearch();
	const isCartBusy = false;

	const isDomainOnCart = cart.hasItem( domainName );

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
