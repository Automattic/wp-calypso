/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	PRODUCTS_WITH_OPTIONS,
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
} from './constants';
import ProductCard from './product-card';
import { slugToSelectorProduct, durationToString } from './utils';
import ProductCardPlaceholder from 'components/jetpack/card/product-card-placeholder';
import FormattedHeader from 'components/formatted-header';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { isProductsListFetching } from 'state/products-list/selectors/is-products-list-fetching';
import { getProductsList } from 'state/products-list/selectors';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';

/**
 * Type dependencies
 */
import type { DetailsPageProps, PurchaseCallback, SelectorProduct } from './types';

import './style.scss';

const DetailsPage = ( { duration, productSlug, rootUrl, header }: DetailsPageProps ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const products = useSelector( ( state ) => getProductsList( state ) );
	const translate = useTranslate();
	const root = rootUrl.replace( ':site', siteSlug );
	const durationSuffix = duration ? '/' + durationToString( duration ) : '';
	const isLoading = ! currencyCode || ( isFetchingProducts && ! products );

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
			{ header }
			<HeaderCake onClick={ backButton }>
				{ isBundle ? translate( 'Bundle Options' ) : translate( 'Product Options' ) }
			</HeaderCake>
			<FormattedHeader
				headerText={
					product.shortName
						? translate( 'Great choice! Now select a %s option:', {
								args: product.shortName,
								comment: 'Short name of the selected generic plan or product',
						  } )
						: translate( 'Great choice! Now select an option:' )
				}
				brandFont
			/>
			<div className="plans-v2__columns">
				{ isLoading ? (
					<>
						<ProductCardPlaceholder className="details__column" />
						<ProductCardPlaceholder className="details__column" />
					</>
				) : (
					product.subtypes.map( ( subtypeSlug ) => {
						const subtypeItem = slugToSelectorProduct( subtypeSlug );
						if ( ! subtypeItem ) {
							// Exit if invalid product.
							return null;
						}
						return (
							<ProductCard
								key={ subtypeSlug }
								item={ subtypeItem }
								siteId={ siteId }
								currencyCode={ currencyCode as string }
								onClick={ () => selectProduct( subtypeItem ) }
								className="details__column"
							/>
						);
					} )
				) }
			</div>
		</Main>
	);
};

export default DetailsPage;
