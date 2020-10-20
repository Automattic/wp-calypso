/**
 * External dependencies
 */
import page from 'page';
import { useTranslate } from 'i18n-calypso';
import React, { ReactNode, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { ProductIcon } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { preventWidows } from 'calypso/lib/formatting';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import {
	JETPACK_SCAN_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
} from 'calypso/lib/products-values/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import QueryProducts from './query-products';
import useIsLoading from './use-is-loading';
import useItemPrice from './use-item-price';
import {
	durationToString,
	durationToText,
	getOptionFromSlug,
	getProductUpsell,
	getPathToSelector,
	getPathToDetails,
	slugToSelectorProduct,
	checkout,
} from './utils';
import withRedirectToSelector from './with-redirect-to-selector';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Type dependencies
 */
import type { Duration, SelectorProduct, UpsellPageProps } from './types';

interface Props {
	siteId: number | null;
	currencyCode: string;
	mainProduct: SelectorProduct;
	upsellProduct: SelectorProduct;
	onBackButtonClick: () => void;
	onPurchaseSingleProduct: () => void;
	onPurchaseBothProducts: () => void;
	isLoading: boolean;
	header: ReactNode;
	pageTracker: ReactNode;
}

const UpsellComponent = ( {
	siteId,
	currencyCode,
	onBackButtonClick,
	onPurchaseSingleProduct,
	onPurchaseBothProducts,
	mainProduct,
	upsellProduct,
	isLoading,
	header,
	pageTracker,
}: Props ) => {
	const translate = useTranslate();

	// Upsell prices should come from the API with the upsell products
	const { originalPrice, discountedPrice } = useItemPrice(
		siteId,
		upsellProduct,
		upsellProduct.monthlyProductSlug || ''
	);

	const { shortName: mainProductName } = mainProduct;
	const { shortName: upsellProductName, productSlug: upsellSlug } = upsellProduct;

	const isScanProduct = useMemo(
		() => JETPACK_SCAN_PRODUCTS.some( ( slug ) => slug === upsellSlug ),
		[ upsellSlug ]
	);
	const isBackupProduct = useMemo(
		() => JETPACK_BACKUP_PRODUCTS.some( ( slug ) => slug === upsellSlug ),
		[ upsellSlug ]
	);

	useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [] );

	return (
		<Main className="upsell" wideLayout>
			{ pageTracker }
			{ header }
			<HeaderCake onClick={ onBackButtonClick }>{ translate( 'Product Options' ) }</HeaderCake>
			{ isLoading ? (
				<div className="upsell__header-placeholder" />
			) : (
				<div className="upsell__header">
					<FormattedHeader
						headerText={ preventWidows(
							translate( 'Would you like to add {{name/}}?', {
								components: {
									name: <>{ upsellProductName }</>,
								},
								comment:
									'{{name/}} is the name of a product such as Jetpack Scan or Jetpack Backup',
							} )
						) }
						brandFont
					/>
					<div className="upsell__icons">
						<ProductIcon className="upsell__product-icon" slug={ mainProduct.iconSlug } />
						<Gridicon className="upsell__plus-icon" icon="plus-small" />
						<ProductIcon className="upsell__product-icon" slug={ upsellProduct.iconSlug } />
					</div>
					{ ( isScanProduct || isBackupProduct ) && (
						<p className="upsell__subheader">
							{ preventWidows(
								isScanProduct
									? translate(
											'Combine {{mainName/}} and {{upsellName/}} to give your site comprehensive protection from malware and other threats.',
											{
												components: {
													mainName: <>{ mainProductName }</>,
													upsellName: <>{ upsellProductName }</>,
												},
												comment:
													"{{mainName/}} refers to the product the customer is purchasing (Backup in that case), {{upsellName/}} to the product we're upselling (Scan in that case)",
											}
									  )
									: translate(
											'Combine {{mainName/}} and {{upsellName/}} to be able to save every change and restore your site in one click.',
											{
												components: {
													mainName: <>{ mainProductName }</>,
													upsellName: <>{ upsellProductName }</>,
												},
												comment:
													"{{mainName/}} refers to the product the customer is purchasing (Scan in that case), {{upsellName/}} to the product we're upselling (Backup in that case)",
											}
									  )
							) }
						</p>
					) }
				</div>
			) }
			{ isLoading ? (
				<div className="upsell__product-card-placeholder" />
			) : (
				<div className="upsell__product-card">
					<JetpackProductCard
						iconSlug={ upsellProduct.iconSlug }
						productName={ upsellProduct.displayName }
						subheadline={ upsellProduct.tagline }
						description={ upsellProduct.description }
						currencyCode={ currencyCode }
						billingTimeFrame={ durationToText( upsellProduct.term ) }
						buttonLabel={ translate( 'Yes, add {{name/}}', {
							components: {
								name: <>{ upsellProductName }</>,
							},
							comment:
								'{{name/}} refers to a name of a product such as Jetpack Backup or Jetpack Scan',
						} ) }
						features={ upsellProduct.features }
						discountedPrice={ discountedPrice }
						originalPrice={ originalPrice }
						onButtonClick={ onPurchaseBothProducts }
						cancelLabel={ translate( 'No, I do not want {{name/}}', {
							components: {
								name: <>{ upsellProductName }</>,
							},
							comment:
								'{{name/}} refers to a name of a product such as Jetpack Backup or Jetpack Scan',
						} ) }
						onCancelClick={ onPurchaseSingleProduct }
					/>
				</div>
			) }
		</Main>
	);
};

const UpsellPage = ( {
	rootUrl,
	urlQueryArgs,
	siteSlug: siteSlugProp,
	productSlug,
	duration,
	header,
}: UpsellPageProps ) => {
	const siteSlugState = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const siteSlug = siteSlugProp || siteSlugState;
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const isLoading = useIsLoading( siteId );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );

	const mainProduct = slugToSelectorProduct( productSlug );
	// TODO: Get upsells via API.
	const upsellProductSlug = getProductUpsell( productSlug );
	const upsellProduct = upsellProductSlug && slugToSelectorProduct( upsellProductSlug );

	const onPurchaseBothProducts = useTrackCallback(
		() => checkout( siteSlug, [ productSlug, upsellProductSlug ], urlQueryArgs ),
		'calypso_product_checkout_click',
		{
			site_id: siteId || undefined,
			product_slug: productSlug,
			upsell_product_slug: upsellProductSlug,
			duration,
		}
	);

	const onPurchaseSingleProduct = useTrackCallback(
		() => checkout( siteSlug, productSlug, urlQueryArgs ),
		'calypso_product_checkout_click',
		{
			site_id: siteId || undefined,
			product_slug: productSlug,
			duration,
		}
	);

	// Construct a URL to send users to when they click the back button. Since at this moment
	// there is only one Jetpack Scan option, the back button takes users back to the Selector
	// page.
	const productOption = getOptionFromSlug( productSlug );
	const selectorPageUrl = getPathToSelector( rootUrl, urlQueryArgs, duration, siteSlug );
	const backUrl = productOption
		? getPathToDetails( rootUrl, urlQueryArgs, productOption, duration as Duration, siteSlug )
		: selectorPageUrl;

	const onBackButtonClick = useTrackCallback( () => page( backUrl ), 'calypso_upsell_back_click', {
		site_id: siteId || undefined,
		product_slug: productSlug,
		duration,
	} );

	const viewTrackerPath = siteId
		? `${ rootUrl }/:product/${ durationToString( duration ) }/additions/:site`
		: `${ rootUrl }/:product/${ durationToString( duration ) }/additions`;
	const viewTrackerProps = siteId
		? { site: siteSlug, product: productSlug }
		: { product: productSlug };

	const pageTracker = (
		<PageViewTracker path={ viewTrackerPath } properties={ viewTrackerProps } title="Details" />
	);

	// If the product is not valid send the user to the selector page.
	if ( ! mainProduct ) {
		page.redirect( selectorPageUrl );
		return null;
	}

	// If there is no upsell product, redirect the user to the checkout page.
	if ( ! upsellProduct ) {
		onPurchaseSingleProduct();
		return null;
	}

	return (
		<>
			<QueryProducts />
			<UpsellComponent
				siteId={ siteId }
				currencyCode={ currencyCode as string }
				mainProduct={ mainProduct }
				upsellProduct={ upsellProduct }
				onPurchaseSingleProduct={ onPurchaseSingleProduct }
				onPurchaseBothProducts={ onPurchaseBothProducts }
				onBackButtonClick={ onBackButtonClick }
				isLoading={ isLoading }
				header={ header }
				pageTracker={ pageTracker }
			/>
		</>
	);
};

export default withRedirectToSelector( UpsellPage );
