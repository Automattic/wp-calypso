/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import page from 'page';
import { Icon, arrowLeft } from '@wordpress/icons';
import DomainPicker from '@automattic/domain-picker';
import { useShoppingCart } from '@automattic/shopping-cart';
import { DomainSuggestions } from '@automattic/data-stores';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import {
	MARKETPLACE_FLOW_ID,
	ANALYTICS_UI_LOCATON_MARKETPLACE_DOMAIN_SELECTION,
} from 'calypso/my-sites/plugins/marketplace/constants';
import { Button } from '@wordpress/components';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getProductsList, isProductsListFetching } from 'calypso/state/products-list/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';

/**
 * Style dependencies
 */
import './style.scss';

function Header() {
	return (
		<div className="marketplace-domain-upsell__header domains__header">
			<h1 className="marketplace-domain-upsell__header marketplace-title">
				{ __( 'Choose a domain' ) }
			</h1>
			<h2 className="marketplace-domain-upsell__header marketplace-subtitle">
				{ __(
					'Yoast SEO requires a top level domain to index your site and help you rank higher.'
				) }
			</h2>
		</div>
	);
}

const redirectToUseDomainFlow = (): void => {
	const useYourDomainUrl = `/start/new-launch/domains-launch/use-your-domain?siteSlug=${ siteSubdomain?.domain }&source=${ launchFlowUrl }`;
	redirectTo( useYourDomainUrl );
};

function DomainPickerContainer( { onDomainSelect, selectedDomain } ) {
	return (
		<DomainPicker
			header={ <Header /> }
			analyticsUiAlgo={ ANALYTICS_UI_LOCATON_MARKETPLACE_DOMAIN_SELECTION }
			analyticsFlowId={ MARKETPLACE_FLOW_ID }
			onDomainSelect={ onDomainSelect }
			currentDomain={ selectedDomain }
			hideRecommendationLabel
			onUseYourDomainClick={ redirectToUseDomainFlow }
		/>
	);
}

function MarketplaceShoppingCart( { onAddDomainToCart, selectedDomain } ) {
	const { responseCart, isLoading } = useShoppingCart();
	const { products, sub_total_display } = responseCart;

	return isLoading ? null : (
		<>
			<h1 className="marketplace-domain-upsell__shopping-cart marketplace-title">Your cart</h1>
			<div className="marketplace-domain-upsell__shopping-cart basket-items">
				{ products.map( ( product ) => {
					return (
						<div
							key={ product.product_name }
							className="marketplace-domain-upsell__shopping-cart basket-item"
						>
							<div>{ product.product_name }</div>
							<div>{ product.item_subtotal_display }</div>
						</div>
					);
				} ) }
			</div>
			<hr />
			<div className="marketplace-domain-upsell__shopping-cart total">
				<div> Total </div>
				<div>{ sub_total_display }</div>
			</div>

			<Button
				onClick={ onAddDomainToCart }
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
	const { addProductsToCart, replaceProductsInCart } = useShoppingCart();
	const products = useSelector( getProductsList );
	const isFetchingProducts = useSelector( isProductsListFetching );
	const selectedSite = useSelector( getSelectedSite );

	useEffect( () => {
		//FIXME: This code segment simulates yoast premium already being added when arriving here. To be removed when plugins page is completed.
		if ( ! isFetchingProducts && products[ 'yoast_premium' ] ) {
			const yoastProduct = fillInSingleCartItemAttributes(
				{ product_slug: 'yoast_premium' },
				products
			);
			replaceProductsInCart( [ yoastProduct ] );
		}
	}, [ isFetchingProducts, products, replaceProductsInCart ] );

	const onAddDomainToCart = () => {
		const { product_slug, domain_name } = selectedDomain;
		const domainProduct = {
			...domainRegistration( {
				productSlug: product_slug,
				domain: domain_name,
				source: 'Marketplace-Yoast-Domain-Upsell',
			} ),
			...selectedDomain,
		};
		addProductsToCart( [ domainProduct ] ).then( () => {
			page( '/checkout/' + selectedSite.slug );
		} );
	};

	const onDomainSelect = ( suggestion: DomainSuggestions.DomainSuggestion ): void => {
		setDomain( suggestion );
	};

	return (
		<div className="marketplace-domain-upsell__root">
			<div className="marketplace-domain-upsell__back-button">
				<Button isBusy={ false } isLink>
					<Icon icon={ arrowLeft } size={ 16 } />
					<span>{ __( 'Back' ) }</span>
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
					onAddDomainToCart={ onAddDomainToCart }
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
