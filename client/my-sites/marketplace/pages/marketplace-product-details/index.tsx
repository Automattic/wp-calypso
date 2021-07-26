/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';
import page from 'page';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	getProductsList,
	isProductsListFetching,
	getProductDisplayCost,
} from 'calypso/state/products-list/selectors';
import { marketplaceDebugger } from 'calypso/my-sites/marketplace/constants';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
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
import { getDefaultPluginInProduct } from 'calypso/my-sites/marketplace/marketplace-product-definitions';
import { IProductGroupCollection, IProductCollection } from 'calypso/my-sites/marketplace/types';

interface MarketplacePluginDetailsInterface {
	productGroupSlug: keyof IProductGroupCollection;
	productSlug: keyof IProductCollection;
}

function MarketplacePluginDetails( {
	productGroupSlug,
	productSlug,
}: MarketplacePluginDetailsInterface ): JSX.Element {
	const defaultPlugin = getDefaultPluginInProduct( productGroupSlug, productSlug );
	const displayCost = useSelector( ( state ) => getProductDisplayCost( state, productSlug ) );

	const translate = useTranslate();
	const { replaceProductsInCart } = useShoppingCart();
	const products = useSelector( getProductsList );
	const isProductListLoading = useSelector( ( state ) => isProductsListFetching( state ) );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSiteId ?? 0 ) );
	const dispatch = useDispatch();
	const eligibilityDetails = useSelector( ( state ) => getEligibility( state, selectedSiteId ) );

	useEffect( () => {
		dispatch( wporgFetchPluginData( defaultPlugin ) );
		selectedSiteId && dispatch( requestEligibility( selectedSiteId ) );
	}, [ dispatch, defaultPlugin, selectedSiteId ] );

	const onAddMarketplaceProductToCart = async (
		productSlug: keyof IProductCollection,
		primaryDomain: string
	) => {
		marketplaceDebugger( `Added marketplace product ${ productSlug } to cart` );

		dispatch( productToBeInstalled( productGroupSlug, productSlug, primaryDomain ) );
		const marketplaceProduct = fillInSingleCartItemAttributes(
			{ product_slug: productSlug },
			products
		);
		return replaceProductsInCart( [ marketplaceProduct ] );
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
			{ ! isProductListLoading ? (
				<PurchaseArea
					productSlug={ productSlug }
					isDisabled={ hasHardBlock }
					siteDomains={ siteDomains }
					displayCost={ displayCost }
					onAddMarketplaceProductToCart={ onAddMarketplaceProductToCart }
					onRemoveEverythingFromCart={ onRemoveEverythingFromCart }
					onNavigateToCheckout={ () => page( `/checkout/${ selectedSiteSlug }` ) }
					onNavigateToDomainsSelection={ () => page( `/marketplace/domain/${ selectedSiteSlug }` ) }
					onInstallProductManually={ ( productSlug, primaryDomain ) => {
						dispatch( productToBeInstalled( productGroupSlug, productSlug, primaryDomain ) );
						page( `/marketplace/product/setup/${ selectedSiteSlug }` );
					} }
				/>
			) : (
				'Loading...'
			) }
		</>
	);
}

export default function MarketplacePluginDetailsWrapper(
	props: MarketplacePluginDetailsInterface
): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<MarketplacePluginDetails { ...props }></MarketplacePluginDetails>
		</CalypsoShoppingCartProvider>
	);
}
