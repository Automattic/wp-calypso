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
		<div className="marketplace-domain-upsell__header domains__header">
			<h1 className="marketplace-domain-upsell__header marketplace-title">Choose a domain</h1>
			<h2 className="marketplace-domain-upsell__header marketplace-subtitle">
				Yoast SEO requires a top level domain to index your site and help you rank higher.
			</h2>
		</div>
	);
}

function DomainPickerContainer( { onDomainSelect, selectedDomain } ) {
	return (
		<DomainPicker
			header={ <Header /> }
			analyticsUiAlgo={ ANALYTICS_UI_LOCATON_MARKETPLACE_DOMAIN_SELECTION }
			analyticsFlowId={ MARKETPLACE_FLOW_ID }
			onDomainSelect={ onDomainSelect }
			currentDomain={ selectedDomain }
		/>
	);
}

function MarketplaceShoppingCart( { onAddToCart, selectedDomain } ) {
	const { responseCart } = useShoppingCart();
	const { products, sub_total_display } = responseCart;

	return (
		<>
			<h1 className="marketplace-domain-upsell__shopping-cart marketplace-title">Your cart</h1>
			<div className="marketplace-domain-upsell__shopping-cart basket-items">
				{ products.map( ( product ) => {
					return (
						<div
							key={ product.meta }
							className="marketplace-domain-upsell__shopping-cart basket-item"
						>
							<div>{ product.meta }</div>
							<div>{ product.item_subtotal_display }</div>
						</div>
					);
				} ) }
			</div>
			<hr />
			<h1 className="marketplace-domain-upsell__shopping-cart total">
				<div> Total </div>
				<div>{ sub_total_display }</div>
			</h1>

			<Button
				onClick={ onAddToCart }
				isBusy={ false }
				isPrimary
				disabled={ selectedDomain === null }
			>
				Checkout
			</Button>
		</>
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
			<div className="marketplace-domain-upsell__back-button">
				<Button isBusy={ false } isLink>
					<svg
						width="17"
						height="13"
						viewBox="0 0 17 13"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M2 6.49999L7.25 0.749995M2 6.49999L17 6.5M2 6.49999L7.25 11.75"
							stroke="#1D2327"
							stroke-width="1.5"
						/>
					</svg>{ ' ' }
					<span>Back</span>
				</Button>
			</div>
			<div className="marketplace-domain-upsell__domain-picker-container">
				<DomainPickerContainer
					onDomainSelect={ onDomainSelect }
					selectedDomain={ selectedDomain }
				/>
			</div>
			<div className="marketplace-domain-upsell__shopping-cart-container">
				<MarketplaceShoppingCart
					onAddToCart={ onAddToCart }
					selectedDomain={ selectedDomain }
					siteUrl={ selectedSite.slug }
				/>
			</div>
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
