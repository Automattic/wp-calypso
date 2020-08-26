/**
 * External dependencies
 */
import page from 'page';
import { useTranslate } from 'i18n-calypso';
import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { ProductIcon } from '@automattic/components';
import Gridicon from 'components/gridicon';
import FormattedHeader from 'components/formatted-header';
import HeaderCake from 'components/header-cake';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import Main from 'components/main';
import { preventWidows } from 'lib/formatting';
import { JETPACK_SCAN_PRODUCTS, JETPACK_BACKUP_PRODUCTS } from 'lib/products-values/constants';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isProductsListFetching, getProductsList } from 'state/products-list/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import useItemPrice from './use-item-price';
import {
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
	currencyCode: string;
	mainProduct: SelectorProduct;
	upsellProduct: SelectorProduct;
	onBackButtonClick: () => void;
	onPurchaseSingleProduct: () => void;
	onPurchaseBothProducts: () => void;
	isLoading: boolean;
}

const UpsellComponent = ( {
	currencyCode,
	onBackButtonClick,
	onPurchaseSingleProduct,
	onPurchaseBothProducts,
	mainProduct,
	upsellProduct,
	isLoading,
}: Props ) => {
	const translate = useTranslate();

	// Upsell prices should come from the API with the upsell products
	const { originalPrice, discountedPrice } = useItemPrice(
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

	return (
		<Main className="upsell">
			<HeaderCake onClick={ onBackButtonClick }>{ translate( 'Product Options' ) }</HeaderCake>
			{ ! isLoading && (
				<>
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
				</>
			) }
		</Main>
	);
};

const UpsellPage = ( { duration, productSlug, rootUrl, header, footer }: UpsellPageProps ) => {
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const products = useSelector( ( state ) => getProductsList( state ) );
	const isLoading = ! currencyCode || ( isFetchingProducts && ! products );

	const mainProduct = slugToSelectorProduct( productSlug );
	// TODO: Get upsells via API.
	const upsellProductSlug = getProductUpsell( productSlug );
	const upsellProduct = upsellProductSlug && slugToSelectorProduct( upsellProductSlug );

	const checkoutCb = useCallback( ( slugs ) => checkout( siteSlug, slugs ), [ siteSlug ] );

	const onPurchaseBothProducts = useCallback(
		() => checkoutCb( [ productSlug, upsellProductSlug ] ),
		[ checkoutCb, productSlug, upsellProductSlug ]
	);

	const onPurchaseSingleProduct = useCallback( () => checkoutCb( productSlug ), [
		checkoutCb,
		productSlug,
	] );

	const selectorPageUrl = getPathToSelector( rootUrl, duration, siteSlug );

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

	// Construct a URL to send users to when they click the back button. Since at this moment
	// there is only one Jetpack Scan option, the back button takes users back to the Selector
	// page.
	const productOption = getOptionFromSlug( productSlug );
	const backUrl = productOption
		? getPathToDetails( rootUrl, productOption, duration as Duration, siteSlug )
		: selectorPageUrl;

	const onBackButtonClick = () => page( backUrl );

	return (
		<>
			{ header }
			<UpsellComponent
				currencyCode={ currencyCode as string }
				mainProduct={ mainProduct }
				upsellProduct={ upsellProduct }
				onPurchaseSingleProduct={ onPurchaseSingleProduct }
				onPurchaseBothProducts={ onPurchaseBothProducts }
				onBackButtonClick={ onBackButtonClick }
				isLoading={ isLoading }
			/>
			{ footer }
		</>
	);
};

export default withRedirectToSelector( UpsellPage );
