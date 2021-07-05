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
import PluginProductMappingInterface, {
	getProductSlug,
	marketplaceDebugger,
} from 'calypso/my-sites/plugins/marketplace/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import {
	isFetching as isWporgPluginFetching,
	getPlugin as getWporgPlugin,
} from 'calypso/state/plugins/wporg/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import PurchaseArea from './purchase-area';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	setPluginSlugToBeInstalled,
	setPrimaryDomainCandidate,
	setIsPluginInstalledDuringPurchase,
} from 'calypso/state/plugins/marketplace/actions';
import { getBlockingMessages } from 'calypso/blocks/eligibility-warnings/hold-list';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import { isAtomicSiteWithoutBusinessPlan } from 'calypso/blocks/eligibility-warnings/utils';
import { requestEligibility } from 'calypso/state/automated-transfer/actions';
import Notice from 'calypso/components/notice';
import { eligibilityHolds } from 'calypso/state/automated-transfer/constants';

interface MarketplacePluginDetailsInterface {
	marketplacePluginSlug: keyof PluginProductMappingInterface;
}

export default function MarketplacePluginDetails( {
	marketplacePluginSlug,
}: MarketplacePluginDetailsInterface ): JSX.Element {
	const translate = useTranslate();
	const productSlug = getProductSlug( marketplacePluginSlug );
	const { replaceProductsInCart } = useShoppingCart();
	const products = useSelector( getProductsList );
	const cost = useSelector( ( state ) => getProductCost( state, productSlug ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isProductListLoading = useSelector( ( state ) => isProductsListFetching( state ) );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSiteId ?? 0 ) );
	const displayCost = formatCurrency( cost, currencyCode, { stripZeros: true } );
	const dispatch = useDispatch();
	const wporgPlugin = useSelector( ( state ) => getWporgPlugin( state, marketplacePluginSlug ) );
	const wporgFetching = useSelector( ( state ) =>
		isWporgPluginFetching( state, marketplacePluginSlug )
	);
	const eligibilityDetails = useSelector( ( state ) => getEligibility( state, selectedSiteId ) );

	useEffect( () => {
		dispatch( wporgFetchPluginData( marketplacePluginSlug ) );
		selectedSiteId && dispatch( requestEligibility( selectedSiteId ) );
	}, [ dispatch, marketplacePluginSlug, selectedSiteId ] );

	// TODO: Come up with a generic model for premium products and free products
	const onAddYoastPremiumToCart = async () => {
		marketplaceDebugger( 'Added marketplace yoast to cart' );

		dispatch( setIsPluginInstalledDuringPurchase( true ) );
		dispatch( setPluginSlugToBeInstalled( 'wordpress-seo-premium' ) );
		const yoastProduct = fillInSingleCartItemAttributes( { product_slug: productSlug }, products );
		return replaceProductsInCart( [ yoastProduct ] );
	};

	const onRemoveEverythingFromCart = () => {
		return replaceProductsInCart( [] );
	};

	const allBlockingMessages = getBlockingMessages( translate );
	const holds = eligibilityDetails.eligibilityHolds || [];
	const raisedBlockingMessages = holds
		.filter( ( message: string ) => allBlockingMessages.hasOwnProperty( message ) )
		.map( ( message: string ) => allBlockingMessages[ message ] );
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
					<Notice status={ message.status } text={ message.message } showDismiss={ false }></Notice>
				) ) }
			{ ! wporgFetching ? (
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
						dispatch( setPluginSlugToBeInstalled( marketplacePluginSlug ) );
						dispatch( setPrimaryDomainCandidate( primaryDomain ) );
						page( `/marketplace/product/setup/${ selectedSiteSlug }?flags=marketplace-yoast` );
					} }
				/>
			) : (
				'Loading...'
			) }
		</>
	);
}
