/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import page from 'page';
import DomainPicker from '@automattic/domain-picker';
import { useShoppingCart } from '@automattic/shopping-cart';
import { DomainSuggestions } from '@automattic/data-stores';
import { __ } from '@wordpress/i18n';
import { ThemeProvider } from 'emotion-theming';

/**
 * Internal dependencies
 */
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import {
	MARKETPLACE_FLOW_ID,
	ANALYTICS_UI_LOCATON_MARKETPLACE_DOMAIN_SELECTION,
} from 'calypso/my-sites/plugins/marketplace/constants';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getProductsList, isProductsListFetching } from 'calypso/state/products-list/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import Item from 'calypso/layout/masterbar/item';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';

/**
 * Style dependencies
 */
import './style.scss';
import MarketplaceShoppingCart from '../components/marketplace-shopping-cart';

function MarketplaceDomainUpsellHeader() {
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

function CalypsoWrappedMarketplaceDomainUpsell(): JSX.Element {
	const [ selectedDomain, setDomain ] = useState< DomainSuggestions.DomainSuggestion | null >(
		null
	);
	const { addProductsToCart, replaceProductsInCart } = useShoppingCart();
	const products = useSelector( getProductsList );
	const previousPath = useSelector( getPreviousPath );
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

	const redirectToUseDomainFlow = (): void => {
		const currentUrl = '/plugins/domain';
		const useYourDomainUrl = `/start/new-launch/domains-launch/use-your-domain?siteSlug=${ selectedSite?.slug }&source=${ currentUrl }`;
		page( useYourDomainUrl );
	};

	const onAddDomainToCart = () => {
		const { product_slug, domain_name } = selectedDomain as DomainSuggestions.DomainSuggestion;
		const domainProduct = {
			...domainRegistration( {
				productSlug: product_slug,
				domain: domain_name,
				source: 'Marketplace-Yoast-Domain-Upsell',
			} ),
			...selectedDomain,
		};
		addProductsToCart( [ domainProduct ] ).then( () => {
			page( '/checkout/' + selectedSite?.slug );
		} );
	};

	const onDomainSelect = ( suggestion: DomainSuggestions.DomainSuggestion ): void => {
		setDomain( suggestion );
	};

	return (
		<>
			<Masterbar>
				<Item
					url={ '#' }
					icon="cross"
					className="marketplace-domain-upsell__close-button"
					onClick={ () =>
						previousPath
							? page( previousPath )
							: page( `/plugins/wordpress-seo/${ selectedSite?.slug }` )
					}
					tooltip={ __( 'Close Checkout' ) }
					tipTarget="close"
				/>
			</Masterbar>
			<div className="marketplace-domain-upsell__root">
				<div className="marketplace-domain-upsell__domain-picker-container">
					<DomainPicker
						header={ <MarketplaceDomainUpsellHeader /> }
						analyticsUiAlgo={ ANALYTICS_UI_LOCATON_MARKETPLACE_DOMAIN_SELECTION }
						analyticsFlowId={ MARKETPLACE_FLOW_ID }
						onDomainSelect={ onDomainSelect }
						currentDomain={ selectedDomain as DomainSuggestions.DomainSuggestion }
						showRecommendationLabel={ false }
						onUseYourDomainClick={ redirectToUseDomainFlow }
					/>
				</div>
				<div className="marketplace-domain-upsell__shopping-cart-container">
					<MarketplaceShoppingCart
						onAddDomainToCart={ onAddDomainToCart }
						selectedDomain={ selectedDomain }
					/>
				</div>
			</div>
		</>
	);
}

export default function MarketplaceDomainUpsell(): JSX.Element {
	return (
		<ThemeProvider theme={ { colors: {}, breakpoints: {}, weights: {}, fonts: {}, fontSize: {} } }>
			<CalypsoShoppingCartProvider>
				<CalypsoWrappedMarketplaceDomainUpsell />
			</CalypsoShoppingCartProvider>
		</ThemeProvider>
	);
}
