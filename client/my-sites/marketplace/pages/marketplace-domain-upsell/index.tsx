import DomainPicker from '@automattic/domain-picker';
import { useShoppingCart } from '@automattic/shopping-cart';
import { isDesktop } from '@automattic/viewport';
import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { HorizontalRule } from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { MarketplaceHeaderTitle } from 'calypso/my-sites/marketplace/components';
import MarketplaceShoppingCart from 'calypso/my-sites/marketplace/components/marketplace-shopping-cart';
import {
	MARKETPLACE_FLOW_ID,
	ANALYTICS_UI_LOCATION_MARKETPLACE_DOMAIN_SELECTION,
} from 'calypso/my-sites/marketplace/constants';
import theme from 'calypso/my-sites/marketplace/theme';
import { setPrimaryDomainCandidate } from 'calypso/state/marketplace/purchase-flow/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import getPreviousPath from 'calypso/state/selectors/get-previous-path';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getWpComDomainBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { DomainSuggestions } from '@automattic/data-stores';

import './style.scss';

const MarketplaceHeaderSubTitle = styled.h2`
	font-size: 0.875rem;
	margin-bottom: 15px;
`;

function MarketplaceDomainUpsellHeader() {
	const translate = useTranslate();

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

const getSiteNameFromURL = ( url: string ) => url?.split( '.' )?.[ 0 ] ?? url;

function CalypsoWrappedMarketplaceDomainUpsell(): JSX.Element {
	const [ selectedDomainProductUUID, setDomainProductUUID ] = useState< string >( '' );
	const [ selectedDomain, setDomain ] = useState< DomainSuggestions.DomainSuggestion | undefined >(
		undefined
	);
	const [ isExpandedBasketView, setIsExpandedBasketView ] = useState( false );
	const cartKey = useCartKey();
	const { addProductsToCart, removeProductFromCart } = useShoppingCart( cartKey );
	const previousPath = useSelector( getPreviousPath );
	const selectedSite = useSelector( getSelectedSite );
	const products = useSelector( getProductsList );
	const domainObject = useSelector( ( state ) =>
		getWpComDomainBySiteId( state, selectedSite?.ID )
	);
	const domain = domainObject?.domain ?? '';
	const siteName = getSiteNameFromURL( domain );
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		setIsExpandedBasketView( isDesktop() );
		selectedSite && dispatch( fetchSiteDomains( selectedSite.ID ) );
	}, [ setIsExpandedBasketView, selectedSite, dispatch ] );

	const redirectToUseDomainFlow = (): void => {
		const currentUrl = '/plugins/domain';
		const useYourDomainUrl = `/start/launch-site/domains-launch/use-your-domain?siteSlug=${ selectedSite?.slug }&source=${ currentUrl }`;
		page( useYourDomainUrl );
	};

	const onDomainSelect = async ( suggestion: DomainSuggestions.DomainSuggestion ) => {
		const { product_slug, domain_name } = suggestion;
		if ( ! product_slug ) {
			throw new Error( 'Cannot select domain without product slug' );
		}
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
		if ( selectedDomainProductUUID ) {
			await removeProductFromCart( selectedDomainProductUUID );
			setDomainProductUUID( '' );
		}

		//Then add the new domain
		const responseCart = await addProductsToCart( [
			fillInSingleCartItemAttributes( domainProduct, products ),
		] );
		const productAdded = responseCart.products.find(
			( { product_slug: added_product_slug } ) => added_product_slug === product_slug
		);
		setDomainProductUUID( productAdded?.uuid ?? '' );
		dispatch( setPrimaryDomainCandidate( suggestion?.domain_name ) );
	};

	const freeWpcomStagingDomain: DomainSuggestions.DomainSuggestion = {
		domain_name: `${ getSiteNameFromURL( selectedSite?.slug ?? '' ) }.wpcomstaging.com`,
		cost: 'Free',
		match_reasons: [ 'Domain name after transfer' ],
		unavailable: false,
		currency_code: 'USD',
		raw_price: 0,
		is_free: true,
	};

	const onExistingSubdomainSelect = async () => {
		setDomain( freeWpcomStagingDomain );
		if ( selectedDomainProductUUID ) {
			await removeProductFromCart( selectedDomainProductUUID );
			setDomainProductUUID( '' );
		}
	};

	return (
		<>
			<Masterbar>
				<Item
					icon="cross"
					className="marketplace-domain-upsell__close-button"
					onClick={ () =>
						previousPath
							? page( previousPath )
							: page(
									`/marketplace/product/details/wordpress-seo${
										selectedSite?.slug ? `/${ selectedSite.slug }` : ''
									}`
							  )
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
						existingSubdomain={ freeWpcomStagingDomain }
						initialDomainSearch={ siteName }
						header={ <MarketplaceDomainUpsellHeader /> }
						analyticsUiAlgo={ ANALYTICS_UI_LOCATION_MARKETPLACE_DOMAIN_SELECTION }
						analyticsFlowId={ MARKETPLACE_FLOW_ID }
						onDomainSelect={ onDomainSelect }
						onExistingSubdomainSelect={ onExistingSubdomainSelect }
						currentDomain={ selectedDomain }
						showRecommendationLabel={ false }
						onUseYourDomainClick={ redirectToUseDomainFlow }
					/>
				</div>
				<div className="marketplace-domain-upsell__shopping-cart-container">
					<MarketplaceShoppingCart
						onCheckout={ () =>
							page( `/checkout${ selectedSite ? `/${ selectedSite.slug }` : '' }` )
						}
						selectedDomainProductUUID={ selectedDomainProductUUID }
						isExpandedBasketView={ isExpandedBasketView }
						toggleExpandedBasketView={ () => setIsExpandedBasketView( ! isExpandedBasketView ) }
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
