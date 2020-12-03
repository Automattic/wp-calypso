/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, DOMAIN_SUGGESTIONS_STORE } from '../stores';
import { useDomainProductFromCart } from './use-cart';

export function useDomainSuggestionFromCart(): DomainSuggestions.DomainSuggestion | undefined {
	const domainProductFromCart = useDomainProductFromCart();

	const domainName = domainProductFromCart?.meta;

	const domainSuggestion = useSelect( ( select ) =>
		domainName
			? select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( domainName, {
					quantity: 1,
					include_wordpressdotcom: false,
					include_dotblogsubdomain: false,
			  } )?.[ 0 ]
			: undefined
	);

	return domainSuggestion;
}

type DomainSelection = {
	onDomainSelect: ( suggestion: DomainSuggestions.DomainSuggestion ) => void;
	onExistingSubdomainSelect: () => void;
	selectedDomain: DomainSuggestions.DomainSuggestion | undefined;
};

export function useDomainSelection(): DomainSelection {
	const { plan } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { setDomain, unsetDomain, unsetPlan, confirmDomainSelection } = useDispatch( LAUNCH_STORE );
	const { domain: selectedDomain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	function onDomainSelect( suggestion: DomainSuggestions.DomainSuggestion ) {
		confirmDomainSelection();
		setDomain( suggestion );
		if ( plan?.isFree ) {
			unsetPlan();
		}
	}

	function onExistingSubdomainSelect() {
		unsetDomain();
	}

	return {
		onDomainSelect,
		onExistingSubdomainSelect,
		selectedDomain,
	};
}
