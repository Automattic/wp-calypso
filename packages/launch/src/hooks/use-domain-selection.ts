/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import type { DomainSuggestions } from '@automattic/data-stores';
import { mockDomainSuggestion, useDomainSuggestions } from '@automattic/domain-picker';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, SITE_STORE, PLANS_STORE } from '../stores';
import LaunchContext from '../context';
import { isDomainProduct } from '../utils';
import type { DomainProduct } from '../utils';
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
			const domainProduct = cart.products?.find( ( item: ResponseCartProduct ) =>
				isDomainProduct( item )
			);
			setDomainProductFromCart( domainProduct );
		} )();
	}, [ siteId, getCart, setDomainProductFromCart ] );

	return domainProductFromCart;
}

export function useDomainSuggestionFromCart(): DomainSuggestions.DomainSuggestion | undefined {
	const domainProductFromCart = useDomainProductFromCart();

	const domainName = domainProductFromCart?.meta;

	// const TLD = domainName?.split( '.' )[ 1 ];

	const domainSuggestions = useDomainSuggestions( domainName, 5, undefined, undefined, {
		include_wordpressdotcom: false,
		exact_sld_matches_only: true,
		include_registered: true,
		// tlds: [ TLD ], // an attempt for more precise results, didn't help
	} )?.allDomainSuggestions;

	// search for a matching suggestion and return `undefined` if nothing matches
	return domainSuggestions?.find( ( domain ) => domain.domain_name === domainName );
}

type DomainSelection = {
	onDomainSelect: ( suggestion: DomainSuggestions.DomainSuggestion ) => void;
	onExistingSubdomainSelect: () => void;
	selectedDomain: DomainSuggestions.DomainSuggestion | undefined;
	currentDomain: DomainSuggestions.DomainSuggestion | undefined;
};

export function useDomainSelection(): DomainSelection {
	const { setDomain, unsetDomain, unsetPlanProductId, confirmDomainSelection } = useDispatch(
		LAUNCH_STORE
	);
	const {
		domain: selectedDomain,
		planProductId,
		confirmedDomainSelection,
	} = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const isPlanFree = useSelect( ( select ) =>
		select( PLANS_STORE ).isPlanProductFree( planProductId )
	);
	const { siteSubdomain, hasPaidDomain, sitePrimaryDomain } = useSiteDomains();

	function onDomainSelect( suggestion: DomainSuggestions.DomainSuggestion ) {
		confirmDomainSelection();
		setDomain( suggestion );
		if ( isPlanFree ) {
			unsetPlanProductId();
		}
	}

	function onExistingSubdomainSelect() {
		confirmDomainSelection();
		unsetDomain();
	}

	let currentDomain: DomainSuggestions.DomainSuggestion | undefined;

	if ( selectedDomain ) {
		currentDomain = selectedDomain;
	} else if ( hasPaidDomain ) {
		currentDomain = mockDomainSuggestion( sitePrimaryDomain?.domain );
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
