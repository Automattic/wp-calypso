/**
 * External dependencies
 */
import React from 'react';
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
import type { UpsellPageProps } from './types';

// There are several things that could go wrong depending on the URL's productSlug:
// - The product slug could not exist.
// - The product slug could be of a product that does not have another product to
// upsell to – Jetpack Anti-Spam is an example.
// - The product slug could have an upsell product but what if the already has that
// product?
//
// TODO:
// - handle the case in which the user already have the upsellProduct (what if the user comes
// directly through an URL to this page?)
// - use correct prices for the upsellProduct – it should be a heavily discounted price

const UpsellPage = ( { duration, productSlug, rootUrl }: UpsellPageProps ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const availableProducts = useSelector( ( state ) => getAvailableProductsList( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	// TODO: Get upsells via API.

	// If the product is not valid or there is no upsell product for it,
	// send the user to the selector page.
	const ownedProduct = slugToSelectorProduct( productSlug );
	const upsellProductSlug = getProductUpsell( productSlug );
	const upsellProduct = upsellProductSlug && slugToSelectorProduct( upsellProductSlug );
	if ( ! ownedProduct || ! upsellProduct ) {
		// The duration is optional, but if we have it keep it.
		let durationSuffix = '';
		if ( duration ) {
			durationSuffix = '/' + durationToString( duration );
		}
		page.redirect( rootUrl.replace( ':site', siteSlug ) + durationSuffix );
		return null;
	}

	// Upsell prices should come from the API with the upsell products
	const upsellProductPrices = getProductPrices( upsellProduct, availableProducts );

	const savedAmount = 100;
	const period = 'year';

	if ( isFetchingProducts || ! currencyCode ) {
		return <h1>Loading...</h1>;
	}

	const { shortName: ownedProductName } = ownedProduct;
	const { shortName: upsellProductName } = upsellProduct;

	const onUpgradeConfirm = () => {
		window.alert( `Add ${ upsellProductName } to the cart...` );
	};

	const onUpgradeCancel = () => {
		window.alert( `Expressing no interest in adding ${ upsellProductName } to the cart...` );
	};

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
					<ProductIcon className="upsell__product-icon" slug={ ownedProduct.iconSlug } />
					<Gridicon className="upsell__plus-icon" icon="plus-small" />
					<ProductIcon className="upsell__product-icon" slug={ upsellProduct.iconSlug } />
				</div>
				<p className="upsell__subheader">
					{ preventWidows(
						translate( 'Bundle %(ownedProduct)s with %(upsellProduct)s and save!', {
							args: {
								ownedProduct: ownedProductName,
								upsellProduct: upsellProductName,
							},
							comment: '%s are abbreviated name of product such as Scan or Backup',
						} )
					) }
				</p>
				<p className="upsell__saved-amount">
					{ preventWidows(
						translate(
							'Save $%(savedAmount)d/%(period)s on %(upsellProduct)s when paired with %(ownedProduct)s',
							{
								args: {
									savedAmount,
									period,
									ownedProduct: ownedProductName,
									upsellProduct: upsellProductName,
								},
								comment: 'period can be month or year',
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
				onButtonClick={ onUpgradeConfirm }
				cancelLabel={ translate( 'No, I do not want %s', {
					args: [ upsellProductName ],
				} ) }
				onCancelClick={ onUpgradeCancel }
			/>
		</Main>
	);
};

export default UpsellPage;
