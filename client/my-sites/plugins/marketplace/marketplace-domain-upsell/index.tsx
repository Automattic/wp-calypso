/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import page from 'page';
import DomainPicker from '@automattic/domain-picker';
import { ResponseCart, useShoppingCart } from '@automattic/shopping-cart';
import { DomainSuggestions } from '@automattic/data-stores';
import { ThemeProvider } from 'emotion-theming';
import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import { isDesktop } from '@automattic/viewport';

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
import { HorizontalRule } from '@wordpress/components';
import ExternalLink from 'calypso/components/external-link';

/**
 * Style dependencies
 */
import 'calypso/my-sites/plugins/marketplace/marketplace-domain-upsell/style.scss';
import MarketplaceShoppingCart from 'calypso/my-sites/plugins/marketplace/components/marketplace-shopping-cart';
import theme from 'calypso/my-sites/plugins/marketplace';

const MarketplaceHeaderTitle = styled.h1`
	font-size: 2rem;
	margin-bottom: 8px;
`;
const MarketplaceHeaderSubTitle = styled.h2`
	font-size: 0.875rem;
	margin-bottom: 15px;
`;

function MarketplaceDomainUpsellHeader() {
	return (
		<div>
			<MarketplaceHeaderTitle className="marketplace-domain-upsell__title wp-brand-font">
				{ translate( 'Choose a domain' ) }
			</MarketplaceHeaderTitle>
			<MarketplaceHeaderSubTitle>
				{ translate(
					'Yoast SEO requires a top level domain to index your site and help you rank higher.'
				) }
			</MarketplaceHeaderSubTitle>
			<ExternalLink
				href="https://yoast.com/domain-names-seo"
				target="_blank"
				rel="noopener noreferrer"
				icon
			>
				{ translate( 'Domain names and their influence on SEO' ) }
			</ExternalLink>
			<HorizontalRule />
		</div>
	);
}

function getSiteNameFromURL( url ) {
	const parts = url?.split( '.' );
	if ( Array.isArray( parts ) && parts.length > 0 ) {
		return parts[ 0 ];
	}
	return url;
}

function CalypsoWrappedMarketplaceDomainUpsell(): JSX.Element {
	const [ selectedDomainProductUUID, setDomainProductUUID ] = useState< string >( '' );
	const [ selectedDomain, setDomain ] = useState< DomainSuggestions.DomainSuggestion | null >(
		null
	);

	const [ isExpandedBasketView, setIsExpandedBasketView ] = useState( false );
	const { addProductsToCart, replaceProductsInCart, removeProductFromCart } = useShoppingCart();
	const products = useSelector( getProductsList );
	const previousPath = useSelector( getPreviousPath );
	const isFetchingProducts = useSelector( isProductsListFetching );
	const selectedSite = useSelector( getSelectedSite );
	const { wpcom_url } = selectedSite;
	const siteName = getSiteNameFromURL( wpcom_url );

	useEffect( () => {
		setIsExpandedBasketView( isDesktop() );
	}, [ setIsExpandedBasketView ] );

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

	const onDomainSelect = ( suggestion: DomainSuggestions.DomainSuggestion ) => {
		const { product_slug, domain_name } = suggestion;
		const domainProduct = {
			...domainRegistration( {
				productSlug: product_slug,
				domain: domain_name,
				source: 'Marketplace-Yoast-Domain-Upsell',
			} ),
			...suggestion,
		};
		setDomain( domainProduct );

		//First remove the previously added domain
		new Promise< void >( ( resolve ) => {
			if ( ! selectedDomainProductUUID ) {
				resolve();
			} else {
				removeProductFromCart( selectedDomainProductUUID ).then( () => {
					setDomainProductUUID( '' );
					resolve();
				} );
			}
		} ).then( () => {
			//Then add the new domain
			addProductsToCart( [ domainProduct ] ).then( ( responseCart: ResponseCart ) => {
				const productAdded = responseCart.products.find(
					( { product_slug: added_product_slug } ) => added_product_slug === product_slug
				);
				setDomainProductUUID( productAdded?.uuid ?? '' );
			} );
		} );
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
					tooltip={ translate( 'Close Domain Selection' ) }
					tipTarget="close"
				/>
			</Masterbar>
			<div
				className={ classnames( 'marketplace-domain-upsell__root', {
					'expanded-basket-view': isExpandedBasketView,
				} ) }
			>
				<div className="marketplace-domain-upsell__domain-picker-container">
					<DomainPicker
						initialDomainSearch={ siteName }
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
						onCheckout={ () => page( '/checkout/' + selectedSite?.slug ) }
						selectedDomainProductUUID={ selectedDomainProductUUID }
						isExpandedBasketView={ isExpandedBasketView }
						toggleExpandedBasketView={ () =>
							isExpandedBasketView
								? setIsExpandedBasketView( false )
								: setIsExpandedBasketView( true )
						}
					/>
				</div>
			</div>
		</>
	);
}

export default function MarketplaceDomainUpsell(): JSX.Element {
	return (
		<ThemeProvider theme={ theme }>
			<CalypsoShoppingCartProvider>
				<CalypsoWrappedMarketplaceDomainUpsell />
			</CalypsoShoppingCartProvider>
		</ThemeProvider>
	);
}
