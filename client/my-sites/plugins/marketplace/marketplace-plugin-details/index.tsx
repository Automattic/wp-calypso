/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';
import page from 'page';

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
} from 'calypso/my-sites/plugins/marketplace/constants';
import formatCurrency from '@automattic/format-currency';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
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
import {
	setPluginSlugToBeInstalled,
	setPrimaryDomainCandidate,
	setIsPluginInstalledDuringPurchase,
} from 'calypso/state/plugins/marketplace/actions';

interface MarketplacePluginDetailsInterface {
	marketplacePluginSlug: keyof PluginProductMappingInterface;
}

function MarketplacePluginDetails( {
	marketplacePluginSlug,
}: MarketplacePluginDetailsInterface ): JSX.Element {
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

	useEffect( () => {
		dispatch( wporgFetchPluginData( marketplacePluginSlug ) );
	}, [ dispatch, marketplacePluginSlug ] );

	const onAddYoastPremiumToCart = async () => {
		dispatch( setIsPluginInstalledDuringPurchase( true ) );
		const yoastProduct = fillInSingleCartItemAttributes( { product_slug: productSlug }, products );
		return replaceProductsInCart( [ yoastProduct ] );
	};

	const onRemoveEverythingFromCart = () => {
		return replaceProductsInCart( [] );
	};

	return (
		<>
			<SidebarNavigation />
			{ ! wporgFetching ? (
				<PurchaseArea
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

export default function MarketplacePluginDetailsWrapper(
	props: MarketplacePluginDetailsInterface
): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<MarketplacePluginDetails { ...props }></MarketplacePluginDetails>
		</CalypsoShoppingCartProvider>
	);
}
