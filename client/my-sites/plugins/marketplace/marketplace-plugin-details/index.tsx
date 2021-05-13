/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
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
import { Button } from '@automattic/components';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import {
	isFetching as isWporgPluginFetching,
	getPlugin as getWporgPlugin,
} from 'calypso/state/plugins/wporg/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';

interface MarketplacePluginDetailsInterface {
	marketplacePluginSlug: keyof PluginProductMappingInterface;
}

function MarketplacePluginDetails( {
	marketplacePluginSlug,
}: MarketplacePluginDetailsInterface ): JSX.Element {
	const [ isButtonClicked, setisButtonClicked ] = useState( false );
	const productSlug = getProductSlug( marketplacePluginSlug );
	const { replaceProductsInCart } = useShoppingCart();
	const products = useSelector( getProductsList );
	const cost = useSelector( ( state ) => getProductCost( state, productSlug ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isProductListLoading = useSelector( ( state ) => isProductsListFetching( state ) );
	const selectedSite = useSelector( getSelectedSite );

	const displayCost = formatCurrency( cost, currencyCode, { stripZeros: true } );
	const dispatch = useDispatch();
	const wporgPlugin = useSelector( ( state ) => getWporgPlugin( state, marketplacePluginSlug ) );
	const wporgFetching = useSelector( ( state ) =>
		isWporgPluginFetching( state, marketplacePluginSlug )
	);

	useEffect( () => {
		dispatch( wporgFetchPluginData( marketplacePluginSlug ) );
	}, [ dispatch, marketplacePluginSlug ] );

	const onAddPlugin = async ( productSlug?: string ) => {
		setisButtonClicked( true );
		if ( productSlug ) {
			const yoastProduct = fillInSingleCartItemAttributes(
				{ product_slug: productSlug },
				products
			);
			await replaceProductsInCart( [ yoastProduct ] );
			page(
				`/plugins/domain${ selectedSite ? `/${ selectedSite.slug }?flags=marketplace-yoast` : '' }`
			);
		} else {
			alert( 'Not implemented yet' );
		}
	};

	return (
		<div>
			{ ! wporgFetching ? (
				<>
					<div className="marketplace-plugin-details__name">{ wporgPlugin?.name }</div>
					<div>
						<h2>Yoast Premium cost : { ! isProductListLoading ? displayCost : '' }</h2>
						<Button busy={ isButtonClicked } onClick={ () => onAddPlugin( productSlug ) } primary>
							Buy Yoast Premium
						</Button>
					</div>
					<div>
						<h2>Yoast Free cost : Free</h2>
						<Button busy={ isButtonClicked } onClick={ () => onAddPlugin() } primary>
							Add Yoast Free
						</Button>
					</div>
				</>
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
