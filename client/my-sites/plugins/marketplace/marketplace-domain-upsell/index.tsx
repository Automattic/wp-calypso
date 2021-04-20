/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import DomainPicker from '@automattic/domain-picker';
import { useShoppingCart } from '@automattic/shopping-cart';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { DomainSuggestions } from '@automattic/data-stores';
import {
	MARKETPLACE_FLOW_ID,
	ANALYTICS_UI_LOCATON_MARKETPLACE_DOMAIN_SELECTION,
} from 'calypso/my-sites/plugins/marketplace/constants';
import { Button } from '@wordpress/components';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './styles.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

function Header() {
	return (
		<div>
			<h1>Choose a domain</h1>
			<p>Yoast SEO requires a top level domain to index your site and help you rank higher.</p>
		</div>
	);
}

function DomainPickerContainer( { onDomainSelect, selectedDomain } ) {
	return (
		<div className="marketplace-domain-upsell__domain-picker-container">
			<DomainPicker
				header={ <Header /> }
				analyticsUiAlgo={ ANALYTICS_UI_LOCATON_MARKETPLACE_DOMAIN_SELECTION }
				analyticsFlowId={ MARKETPLACE_FLOW_ID }
				onDomainSelect={ onDomainSelect }
				currentDomain={ selectedDomain }
			/>
		</div>
	);
}

function MarketplaceShoppingCart( { onAddToCart, selectedDomain } ) {
	return (
		<div className="marketplace-domain-upsell__shopping-cart-container">
			<h1>Your cart</h1>
			<Button
				onClick={ onAddToCart }
				buttonType="primary"
				isBusy={ false }
				isPrimary
				disabled={ selectedDomain === null }
			>
				Checkout
			</Button>
		</div>
	);
}

function CalypsoWrappedMarketplaceDomainUpsell(): JSX.Element {
	const [ selectedDomain, setDomain ] = useState( null );
	const { addProductsToCart } = useShoppingCart();
	const selectedSite = useSelector( getSelectedSite );

	const onAddToCart = () => {
		const { product_slug, domain_name } = selectedDomain;
		const domainProduct = {
			...domainRegistration( {
				productSlug: product_slug,
				domain: domain_name,
				source: 'Marketplace-Yoast-Domain-Upsell',
			} ),
			...selectedDomain,
		};
		addProductsToCart( [ domainProduct ] );
		window.location.href = window.location.origin + '/checkout/' + selectedSite.slug;
	};

	const onDomainSelect = ( suggestion: DomainSuggestion ): void => {
		setDomain( suggestion );
	};

	return (
		<div className="marketplace-domain-upsell__root">
			<DomainPickerContainer onDomainSelect={ onDomainSelect } selectedDomain={ selectedDomain } />
			<MarketplaceShoppingCart onAddToCart={ onAddToCart } selectedDomain={ selectedDomain } />
		</div>
	);
}

export default function MarketplaceDomainUpsell(): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<CalypsoWrappedMarketplaceDomainUpsell />
		</CalypsoShoppingCartProvider>
	);
}
