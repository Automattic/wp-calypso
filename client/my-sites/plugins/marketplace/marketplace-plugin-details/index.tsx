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
import { getSelectedSite } from 'calypso/state/ui/selectors';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import PurchaseArea from './purchase-area';

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
	const selectedSite = useSelector( getSelectedSite );
	const siteDomains = useSelector( ( state ) =>
		getDomainsBySiteId( state, selectedSite?.ID ?? 0 )
	);
	const displayCost = formatCurrency( cost, currencyCode, { stripZeros: true } );
	const dispatch = useDispatch();
	const wporgPlugin = useSelector( ( state ) => getWporgPlugin( state, marketplacePluginSlug ) );
	const wporgFetching = useSelector( ( state ) =>
		isWporgPluginFetching( state, marketplacePluginSlug )
	);

	useEffect( () => {
		dispatch( wporgFetchPluginData( marketplacePluginSlug ) );
	}, [ dispatch, marketplacePluginSlug ] );

	const onAddYoastPremiumToCart = () => {
		const yoastProduct = fillInSingleCartItemAttributes( { product_slug: productSlug }, products );
		return replaceProductsInCart( [ yoastProduct ] );
	};

	return (
		<div>
			{ ! wporgFetching ? (
				<PurchaseArea
					siteDomains={ siteDomains }
					isProductListLoading={ isProductListLoading }
					displayCost={ displayCost }
					wporgPluginName={ wporgPlugin?.name }
					onAddYoastPremiumToCart={ onAddYoastPremiumToCart }
					onNavigateToCheckout={ () =>
						page( `/checkout${ selectedSite?.slug ? `/${ selectedSite?.slug }` : '' }` )
					}
					onNavigateToDomainsSelection={ () =>
						page(
							`/plugins/domain${
								selectedSite?.slug ? `/${ selectedSite?.slug }?flags=marketplace-yoast` : ''
							}`
						)
					}
				/>
			) : (
				'Loading...'
			) }
		</div>
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
