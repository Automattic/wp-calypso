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
import Gridicon from 'components/gridicon';
import FormattedHeader from 'components/formatted-header';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import Main from 'components/main';
import { addItem, addItems } from 'lib/cart/actions';
import { jetpackProductItem } from 'lib/cart-values/cart-items';
import { preventWidows } from 'lib/formatting';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isProductsListFetching, getAvailableProductsList } from 'state/products-list/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import {
	durationToString,
	durationToText,
	getProductPrices,
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

// There are several things that could go wrong depending on the URL
// - The product slug could not exist.
// - The product slug could be of a product that does not have another product to
// upsell to – Jetpack Anti-Spam is an example.
// - The product slug could have an upsell product but what if the user already has that
// product?
// - What if the user already owns the product associated with the product slug?

interface Props {
	currencyCode: string;
	mainProduct: SelectorProduct;
	upsellProduct: SelectorProduct;
}

const UpsellComponent = ( { currencyCode, mainProduct, upsellProduct }: Props ) => {
	const translate = useTranslate();

	const availableProducts = useSelector( ( state ) => getAvailableProductsList( state ) );

	// Upsell prices should come from the API with the upsell products
	const upsellProductPrices = getProductPrices( upsellProduct, availableProducts );
	const savedAmount = 100;

	const { shortName: mainProductName, productSlug } = mainProduct;
	const { shortName: upsellProductName, productSlug: upsellProductSlug } = upsellProduct;

	const onPurchaseBothProducts = useCallback( () => {
		addItems( [ jetpackProductItem( productSlug ), jetpackProductItem( upsellProductSlug ) ] );
	}, [ productSlug, upsellProductSlug ] );

	const onPurchaseSingleProduct = useCallback( () => {
		addItem( [ jetpackProductItem( productSlug ) ] );
	}, [ productSlug ] );

	return (
		<Main className="upsell">
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
							comment: '%s are abbreviated name of product such as Scan or Backup',
						} )
					) }
				</p>
				<p className="upsell__saved-amount">
					{ preventWidows(
						translate(
							'Save $%(savedAmount)d/year on %(upsellProduct)s when paired with %(mainProduct)s',
							{
								args: {
									savedAmount,
									mainProduct: mainProductName,
									upsellProduct: upsellProductName,
								},
							}
						)
					) }
				</p>
			</div>

			<JetpackProductCard
				iconSlug={ upsellProduct.iconSlug }
				productName={ upsellProduct.displayName }
				subheadline={ upsellProduct.tagline }
				description={ upsellProduct.description }
				currencyCode={ currencyCode }
				billingTimeFrame={ durationToText( upsellProduct.term ) }
				buttonLabel={ translate( 'Yes, add %s', { args: [ upsellProductName ] } ) }
				features={ { items: [] } }
				discountedPrice={ upsellProductPrices.discountCost }
				originalPrice={ upsellProductPrices.cost || 0 }
				onButtonClick={ onPurchaseBothProducts }
				cancelLabel={ translate( 'No, I do not want %s', {
					args: [ upsellProductName ],
				} ) }
				onCancelClick={ onPurchaseSingleProduct }
			/>
		</Main>
	);
};

const UpsellPage = ( { duration, productSlug, rootUrl }: UpsellPageProps ) => {
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );

	const mainProduct = slugToSelectorProduct( productSlug );
	// TODO: Get upsells via API.
	const upsellProductSlug = getProductUpsell( productSlug );
	const upsellProduct = upsellProductSlug && slugToSelectorProduct( upsellProductSlug );

	// If the product is not valid or there is no upsell product for it,
	// send the user to the selector page.
	if ( ! mainProduct || ! upsellProduct ) {
		// The duration is optional, but if we have it keep it.
		let durationSuffix = '';
		if ( duration ) {
			durationSuffix = '/' + durationToString( duration );
		}
		page.redirect( rootUrl.replace( ':site', siteSlug ) + durationSuffix );
		return null;
	}

	if ( isFetchingProducts || ! currencyCode ) {
		return <h1>Loading...</h1>;
	}

	return (
		<UpsellComponent
			currencyCode={ currencyCode }
			mainProduct={ mainProduct }
			upsellProduct={ upsellProduct }
		/>
	);
};

export default UpsellPage;
