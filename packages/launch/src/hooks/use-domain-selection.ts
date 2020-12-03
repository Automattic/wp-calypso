/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import type { DomainSuggestions } from '@automattic/data-stores';
import { mockDomainSuggestion } from '@automattic/domain-picker';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, SITE_STORE, DOMAIN_SUGGESTIONS_STORE } from '../stores';
import LaunchContext from '../context';
import { isDomainProduct } from '../utils';
import type { Product, DomainProduct } from '../utils';
import { useSiteDomains } from './use-site-domains';

export function useDomainProductFromCart(): DomainProduct | undefined {
	const { siteId } = React.useContext( LaunchContext );
	const { getCart } = useDispatch( SITE_STORE );

	const [ domainProductFromCart, setDomainProductFromCart ] = React.useState<
		DomainProduct | undefined
	>( undefined );

	React.useEffect( () => {
		( async function () {
			const cart = await getCart( siteId );
			const domainProduct = cart.products?.find( ( item: Product ) => isDomainProduct( item ) );
			setDomainProductFromCart( domainProduct );
		} )();
	}, [ siteId, getCart, setDomainProductFromCart ] );

	return domainProductFromCart;
}

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
	currentDomain: DomainSuggestions.DomainSuggestion | undefined;
};

export function useDomainSelection(): DomainSelection {
	const { setDomain, unsetDomain, unsetPlan, confirmDomainSelection } = useDispatch( LAUNCH_STORE );
	const { domain: selectedDomain, plan, confirmedDomainSelection } = useSelect( ( select ) =>
		select( LAUNCH_STORE ).getState()
	);
	const { siteSubdomain } = useSiteDomains();

	function onDomainSelect( suggestion: DomainSuggestions.DomainSuggestion ) {
		confirmDomainSelection();
		setDomain( suggestion );
		if ( plan?.isFree ) {
			unsetPlan();
		}
	}

	function onExistingSubdomainSelect() {
		confirmDomainSelection();
		unsetDomain();
	}

	let currentDomain: DomainSuggestions.DomainSuggestion | undefined;

	if ( selectedDomain ) {
		currentDomain = selectedDomain;
	} else if ( confirmedDomainSelection ) {
		// in the scenario where confirmedDomainSelection is true and selectedDomain is falsey we can assume they've selected the sub-domain
		currentDomain = mockDomainSuggestion( siteSubdomain?.domain );
	}

	return {
		onDomainSelect,
		onExistingSubdomainSelect,
		selectedDomain,
		currentDomain,
	};
}
