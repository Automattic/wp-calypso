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
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';

interface MarketplacePluginDetailsInterface {
	marketplacePluginSlug: keyof PluginProductMappingInterface;
}

const isCustomDomain = ( {
	isWPCOMDomain,
	isWpcomStagingDomain,
}: {
	isWPCOMDomain: boolean;
	isWpcomStagingDomain: boolean;
} ) => ! isWPCOMDomain && ! isWpcomStagingDomain;

function evaluateIsCustomDomainAvailable( siteDomains: any[] ): boolean {
	return siteDomains.some( isCustomDomain );
}
function evaluateIsCustomDomainPrimary( siteDomains: any[] ): boolean {
	return (
		evaluateIsCustomDomainAvailable( siteDomains ) && siteDomains.find( isCustomDomain )?.isPrimary
	);
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

	const onAddPlugin = async ( productSlug?: string ) => {
		setisButtonClicked( true );
		const isCustomDomainAvailable = evaluateIsCustomDomainAvailable( siteDomains );
		const isCustomDomainPrimary = evaluateIsCustomDomainPrimary( siteDomains );
		const isProductPurchased = !! productSlug;

		if ( isCustomDomainAvailable && isCustomDomainPrimary ) {
			if ( isProductPurchased ) {
				const yoastProduct = fillInSingleCartItemAttributes(
					{ product_slug: productSlug },
					products
				);
				await replaceProductsInCart( [ yoastProduct ] );
				page( `/checkout${ selectedSite ? `/${ selectedSite.slug }` : '' }` );
			} else {
				//To be replaced with loading screen and then thank-you page
				alert( 'To be implemented : Loading Screen -> Thank You Page' );
			}
		} else if ( isCustomDomainAvailable && ! isCustomDomainPrimary ) {
			//Pop up Modal for deciding on primary domain and related logic
			setisButtonClicked( false );
			alert( 'To be implemented : Domain deciding Pop up modal ' );
		} else if ( ! isCustomDomainAvailable ) {
			page(
				`/plugins/domain${ selectedSite ? `/${ selectedSite.slug }?flags=marketplace-yoast` : '' }`
			);
		} else {
			alert( 'Unknown combination' );
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
