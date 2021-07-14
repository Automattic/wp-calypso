/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';
import page from 'page';
import { useTranslate } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import {
	getProductsList,
	getProductCost,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';
import { IProductCollection, IProductGroupCollection } from 'calypso/my-sites/marketplace/types';
import {
	getDefaultPluginInProduct,
	marketplaceDebugger,
} from 'calypso/my-sites/marketplace/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import {
	isFetching as isWporgPluginFetching,
	getPlugin as getWporgPlugin,
} from 'calypso/state/plugins/wporg/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import PurchaseArea from './purchase-area';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import { getBlockingMessages } from 'calypso/blocks/eligibility-warnings/hold-list';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import { isAtomicSiteWithoutBusinessPlan } from 'calypso/blocks/eligibility-warnings/utils';
import { requestEligibility } from 'calypso/state/automated-transfer/actions';
import Notice from 'calypso/components/notice';
import { eligibilityHolds } from 'calypso/state/automated-transfer/constants';

interface MarketplaceProductDetailsInterface {
	productGroupSlug: keyof IProductGroupCollection;
	productSlug: keyof IProductCollection;
}

function MarketplaceProductDetailsPage( {
	productGroupSlug,
	productSlug,
}: MarketplaceProductDetailsInterface ): JSX.Element {
	const translate = useTranslate();
	const { replaceProductsInCart } = useShoppingCart();
	const products = useSelector( getProductsList );

	const pluginSlug = getDefaultPluginInProduct( productGroupSlug, productSlug ) ?? '';
	const cost = useSelector( ( state ) => getProductCost( state, productSlug ) );
	const wporgPlugin = useSelector( ( state ) => getWporgPlugin( state, pluginSlug ) );
	const wporgFetching = useSelector( ( state ) => isWporgPluginFetching( state, pluginSlug ) );

	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isProductListLoading = useSelector( ( state ) => isProductsListFetching( state ) );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSiteId ?? 0 ) );
	const displayCost =
		cost && currencyCode ? formatCurrency( cost, currencyCode, { stripZeros: true } ) : null;
	const dispatch = useDispatch();
	const eligibilityDetails = useSelector( ( state ) => getEligibility( state, selectedSiteId ) );

	useEffect( () => {
		dispatch( wporgFetchPluginData( pluginSlug ) );
		selectedSiteId && dispatch( requestEligibility( selectedSiteId ) );
	}, [ dispatch, pluginSlug, selectedSiteId ] );

	// TODO: Remove yoast specific references here and make this call more generic
	const onAddYoastPremiumToCart = async ( primaryDomain: string ) => {
		marketplaceDebugger( 'Added marketplace yoast to cart' );

		dispatch( productToBeInstalled( productGroupSlug, productSlug, primaryDomain ) );
		const yoastProduct = fillInSingleCartItemAttributes( { product_slug: productSlug }, products );
		return replaceProductsInCart( [ yoastProduct ] );
	};

	const onRemoveEverythingFromCart = () => {
		return replaceProductsInCart( [] );
	};

	const allBlockingMessages = getBlockingMessages( translate );
	const holds = eligibilityDetails.eligibilityHolds || [];
	const raisedBlockingMessages = holds
		.filter( ( messageCode: string ) => allBlockingMessages.hasOwnProperty( messageCode ) )
		.map( ( messageCode: string ) => ( { messageCode, ...allBlockingMessages[ messageCode ] } ) );
	const hasHardBlockSingleMessage = holds.some(
		( message: string ) =>
			message !== eligibilityHolds.TRANSFER_ALREADY_EXISTS &&
			allBlockingMessages.hasOwnProperty( message )
	);
	const hasHardBlock = isAtomicSiteWithoutBusinessPlan( holds ) || hasHardBlockSingleMessage;

	return (
		<>
			<SidebarNavigation />
			{ hasHardBlock &&
				raisedBlockingMessages.map( ( message ) => (
					<Notice
						key={ message.messageCode }
						status={ message.status }
						text={ message.message }
						showDismiss={ false }
					/>
				) ) }
			{ ! wporgFetching ? (
				// TODO : Refactor purchase area to be product centric
				<PurchaseArea
					isDisabled={ hasHardBlock }
					siteDomains={ siteDomains }
					isProductListLoading={ isProductListLoading }
					displayCost={ displayCost }
					wporgPluginName={ wporgPlugin?.name }
					onAddYoastPremiumToCart={ onAddYoastPremiumToCart }
					onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
					onNavigateToCheckout={ () =>
						page( `/checkout/${ selectedSiteSlug }?flags=marketplace-yoast` )
					}
					onNavigateToDomainsSelection={ () =>
						page( `/marketplace/domain/${ selectedSiteSlug }?flags=marketplace-yoast` )
					}
					onInstallPluginManually={ async ( primaryDomain ) => {
						dispatch( productToBeInstalled( productGroupSlug, productSlug, primaryDomain ) );
						page( `/marketplace/product/setup/${ selectedSiteSlug }?flags=marketplace-yoast` );
					} }
				/>
			) : (
				'Loading...'
			) }
		</>
	);
}

export function MarketplaceProductDetails(
	props: MarketplaceProductDetailsInterface
): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<MarketplaceProductDetailsPage { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
