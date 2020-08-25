/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import page from 'page';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ProductIcon } from '@automattic/components';
import { getCurrencyObject } from '@automattic/format-currency';
import Gridicon from 'components/gridicon';
import FormattedHeader from 'components/formatted-header';
import HeaderCake from 'components/header-cake';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import Main from 'components/main';
import { addItem, addItems } from 'lib/cart/actions';
import { jetpackProductItem } from 'lib/cart-values/cart-items';
import { preventWidows } from 'lib/formatting';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isProductsListFetching } from 'state/products-list/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import useItemPrice from './use-item-price';
import {
	durationToString,
	durationToText,
	getOptionFromSlug,
	getProductUpsell,
	slugToSelectorProduct,
} from './utils';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Type dependencies
 */
import type { SelectorProduct, UpsellPageProps } from './types';

interface Props {
	currencyCode: string;
	mainProduct: SelectorProduct;
	upsellProduct: SelectorProduct;
	onBackButtonClick: () => void;
	onPurchaseSingleProduct: () => void;
	onPurchaseBothProducts: () => void;
}

const UpsellComponent = ( {
	currencyCode,
	onBackButtonClick,
	onPurchaseSingleProduct,
	onPurchaseBothProducts,
	mainProduct,
	upsellProduct,
}: Props ) => {
	const translate = useTranslate();

	// Upsell prices should come from the API with the upsell products
	const { originalPrice, discountedPrice } = useItemPrice(
		upsellProduct,
		upsellProduct.monthlyProductSlug || ''
	);
	const savedAmount = 100;

	const { shortName: mainProductName } = mainProduct;
	const { shortName: upsellProductName } = upsellProduct;

	const { symbol: currencySymbol } = getCurrencyObject( originalPrice, currencyCode ) || {
		symbol: '$',
	};

	return (
		<Main className="upsell">
			<HeaderCake onClick={ onBackButtonClick }>{ translate( 'Product Options' ) }</HeaderCake>
			<div className="upsell__header">
				<FormattedHeader
					headerText={ preventWidows(
						translate( 'Would you like to add %s?', {
							args: [ upsellProductName ],
							comment: '%s is the name of a product such as Jetpack Scan or Jetpack Backup',
						} )
					) }
					brandFont
				/>
				<div className="upsell__icons">
					<ProductIcon className="upsell__product-icon" slug={ mainProduct.iconSlug } />
					<Gridicon className="upsell__plus-icon" icon="plus-small" />
					<ProductIcon className="upsell__product-icon" slug={ upsellProduct.iconSlug } />
				</div>
				<p className="upsell__subheader">
					{ preventWidows(
						translate( 'Bundle %(mainProduct)s with %(upsellProduct)s and save!', {
							args: {
								mainProduct: mainProductName,
								upsellProduct: upsellProductName,
							},
							comment:
								'%(mainProduct)s and %(upsellProduct)s are abbreviated name of product such as Scan or Backup',
						} )
					) }
				</p>
				<p className="upsell__saved-amount">
					{ preventWidows(
						translate(
							'Save %(currencySymbol)s%(savedAmount)d/year on %(upsellProduct)s when paired with %(mainProduct)s',
							{
								args: {
									savedAmount,
									mainProduct: mainProductName,
									upsellProduct: upsellProductName,
									currencySymbol,
								},
								comment:
									'%(savedAmount)s refers to the saved amount by purchasing two products together such as Jetpack Backup and Jetpack Scan',
							}
						)
					) }
				</p>
			</div>

			<div className="upsell__product-card">
				<JetpackProductCard
					iconSlug={ upsellProduct.iconSlug }
					productName={ upsellProduct.displayName }
					subheadline={ upsellProduct.tagline }
					description={ upsellProduct.description }
					currencyCode={ currencyCode }
					billingTimeFrame={ durationToText( upsellProduct.term ) }
					buttonLabel={ translate( 'Yes, add %s', {
						args: [ upsellProductName ],
						comment: '%s refers to a name of a product such as Jetpack Backup or Jetpack Scan',
					} ) }
					features={ upsellProduct.features }
					discountedPrice={ discountedPrice }
					originalPrice={ originalPrice }
					onButtonClick={ onPurchaseBothProducts }
					cancelLabel={ translate( 'No, I do not want %s', {
						args: [ upsellProductName ],
						comment: '%s refers to a name of a product such as Jetpack Backup or Jetpack Scan',
					} ) }
					onCancelClick={ onPurchaseSingleProduct }
				/>
			</div>
		</Main>
	);
};

const UpsellPage = ( { duration, productSlug, rootUrl, header, footer }: UpsellPageProps ) => {
	const selectedSiteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );

	const mainProduct = slugToSelectorProduct( productSlug );
	// TODO: Get upsells via API.
	const upsellProductSlug = getProductUpsell( productSlug );
	const upsellProduct = upsellProductSlug && slugToSelectorProduct( upsellProductSlug );

	const goToCheckout = useCallback( () => {
		page.redirect( `/checkout/${ selectedSiteSlug }` );
	}, [ selectedSiteSlug ] );

	const onPurchaseBothProducts = useCallback( () => {
		addItems( [
			jetpackProductItem( productSlug ),
			jetpackProductItem( upsellProductSlug as string ),
		] );
		goToCheckout();
	}, [ goToCheckout, productSlug, upsellProductSlug ] );

	const onPurchaseSingleProduct = useCallback( () => {
		addItem( jetpackProductItem( productSlug ) );
		goToCheckout();
	}, [ goToCheckout, productSlug ] );

	const urlWithSiteSlug = rootUrl.replace( ':site', selectedSiteSlug );
	const durationSuffix = duration ? durationToString( duration ) : '';

	// If the product is not valid send the user to the selector page.
	if ( ! mainProduct ) {
		page.redirect( urlWithSiteSlug + '/' + durationSuffix );
		return null;
	}

	// If there is no upsell product, redirect the user to the checkout page.
	if ( ! upsellProduct ) {
		onPurchaseSingleProduct();
		return null;
	}

	if ( isFetchingProducts || ! currencyCode ) {
		return <h1>Loading...</h1>;
	}

	// Construct a URL to send users to when they click the back button. Since at this moment
	// there is only one Jetpack Scan option, the back button takes users back to the Selector
	// page.
	const productOption = getOptionFromSlug( productSlug );
	const backUrl = productOption
		? [ urlWithSiteSlug, productOption, durationSuffix, 'details' ].join( '/' )
		: urlWithSiteSlug;

	const onBackButtonClick = () => page( backUrl );

	return (
		<>
			{ header }
			<UpsellComponent
				currencyCode={ currencyCode }
				mainProduct={ mainProduct }
				upsellProduct={ upsellProduct }
				onPurchaseSingleProduct={ onPurchaseSingleProduct }
				onPurchaseBothProducts={ onPurchaseBothProducts }
				onBackButtonClick={ onBackButtonClick }
			/>
			{ footer }
		</>
	);
};

export default UpsellPage;
