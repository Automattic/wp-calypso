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
import {
	slugToSelectorProduct,
	durationToString,
	durationToText,
	productButtonLabel,
	getProductPrices,
} from './utils';
import {
	PRODUCTS_WITH_OPTIONS,
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
} from './constants';
import FormattedHeader from 'components/formatted-header';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import JetpackBundleCard from 'components/jetpack/card/jetpack-bundle-card';
import JetpackProductCard from 'components/jetpack/card/jetpack-product-card';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getAvailableProductsList } from 'state/products-list/selectors/get-available-products-list';
import { isProductsListFetching } from 'state/products-list/selectors/is-products-list-fetching';
import { getProductCost } from 'state/products-list/selectors/get-product-cost';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Type dependencies
 */
import type { DetailsPageProps, PurchaseCallback, SelectorProduct } from './types';

import './style.scss';

type Cost = {
	originalPrice: number;
	discountedPrice?: number;
};

const ProductComponent = ( {
	productSlug,
	onClick,
	currencyCode,
}: {
	productSlug: string;
	onClick: PurchaseCallback;
	currencyCode: string;
} ) => {
	const availableProducts = useSelector( ( state ) => getAvailableProductsList( state ) );
	const price = useSelector( ( state ) => getProductCost( state, productSlug ) ) || 0;
	const product = slugToSelectorProduct( productSlug );
	if ( ! product ) {
		return null;
	}
	const isBundle = [ OPTIONS_JETPACK_SECURITY, OPTIONS_JETPACK_SECURITY_MONTHLY ].includes(
		productSlug
	);
	const JetpackCard = isBundle ? JetpackBundleCard : JetpackProductCard;

	let cost: Cost = { originalPrice: 0 };
	if ( isBundle ) {
		cost = { originalPrice: price || 0 };
	} else {
		const productPrices = getProductPrices( product, availableProducts );
		cost = {
			originalPrice: productPrices.cost || 0,
			discountedPrice: productPrices.discountCost,
		};
	}

	return (
		<JetpackCard
			key={ productSlug }
			iconSlug={ product.iconSlug }
			productName={ product.displayName }
			subheadline={ product.tagline }
			description={ product.description }
			currencyCode={ currencyCode }
			billingTimeFrame={ durationToText( product.term ) }
			buttonLabel={ productButtonLabel( product ) }
			onButtonClick={ () => onClick( product ) }
			features={ { items: [] } }
			className="details__column"
			{ ...cost }
		/>
	);
};

const DetailsPage = ( { duration, productSlug, rootUrl }: DetailsPageProps ) => {
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const translate = useTranslate();
	const root = rootUrl.replace( ':site', siteSlug );
	const durationSuffix = duration ? '/' + durationToString( duration ) : '';

	// If the product slug isn't one that has options, proceed to the upsell.
	if ( ! ( PRODUCTS_WITH_OPTIONS as readonly string[] ).includes( productSlug ) ) {
		page.redirect( `${ root }/${ productSlug }${ durationSuffix }` );
		return null;
	}

	// If the product is not valid, send the user to the selector page.
	const product = slugToSelectorProduct( productSlug );
	if ( ! product ) {
		page.redirect( root + durationSuffix );
		return null;
	}

	if ( ! currencyCode || isFetchingProducts ) {
		return null; // TODO: Loading component!
	}

	// Go to a new page for upsells.
	const selectProduct: PurchaseCallback = ( selectedProduct: SelectorProduct ) => {
		page(
			`${ root }/${ selectedProduct.productSlug }/` +
				`${ durationToString( selectedProduct.term ) }/additions`
		);
	};

	const isBundle = [ OPTIONS_JETPACK_SECURITY, OPTIONS_JETPACK_SECURITY_MONTHLY ].includes(
		productSlug
	);
	const backButton = () => page( root + durationSuffix );

	return (
		<Main className="details__main" wideLayout>
			<HeaderCake onClick={ backButton }>
				{ isBundle ? translate( 'Bundle Options' ) : translate( 'Product Options' ) }
			</HeaderCake>
			<FormattedHeader headerText="Great choice! Now select a backup option:" brandFont />
			<div className="plans-v2__columns">
				{ product.subtypes.map( ( subtypeSlug ) => (
					<ProductComponent
						key={ subtypeSlug }
						productSlug={ subtypeSlug }
						onClick={ selectProduct }
						currencyCode={ currencyCode }
					/>
				) ) }
			</div>
		</Main>
	);
};

export default DetailsPage;
