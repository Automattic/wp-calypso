/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { TERM_MONTHLY } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions/record';
import {
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
	PRODUCTS_WITH_OPTIONS,
} from './constants';
import PlansFilterBar from './plans-filter-bar';
import ProductCard from './product-card';
import {
	slugToSelectorProduct,
	getPathToSelector,
	getPathToUpsell,
	getPathToDetails,
	checkout,
} from './utils';
import QueryProducts from './query-products';
import useIsLoading from './use-is-loading';
import useHasProductUpsell from './use-has-product-upsell';
import ProductCardPlaceholder from 'components/jetpack/card/product-card-placeholder';
import FormattedHeader from 'components/formatted-header';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSiteSlug, getSelectedSiteId } from 'state/ui/selectors';
import withRedirectToSelector from './with-redirect-to-selector';

/**
 * Type dependencies
 */
import type { Duration, DetailsPageProps, PurchaseCallback, SelectorProduct } from './types';
import type { ProductSlug } from 'lib/products-values/types';

import './style.scss';

const DetailsPage = ( { duration, productSlug, rootUrl, header }: DetailsPageProps ) => {
	const dispatch = useDispatch();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const hasUpsell = useHasProductUpsell();
	const translate = useTranslate();
	const isLoading = useIsLoading( siteId );

	// If the product slug isn't one that has options, proceed to the upsell.
	if ( ! ( PRODUCTS_WITH_OPTIONS as readonly string[] ).includes( productSlug ) ) {
		page.redirect( getPathToUpsell( rootUrl, productSlug, duration as Duration, siteSlug ) );
		return null;
	}

	const selectorPageUrl = getPathToSelector( rootUrl, duration, siteSlug );

	// If the product is not valid, send the user to the selector page.
	const product = slugToSelectorProduct( productSlug );
	if ( ! product ) {
		page.redirect( selectorPageUrl );
		return null;
	}

	// Go to a new page for upsells.
	const selectProduct: PurchaseCallback = ( { productSlug: slug }: SelectorProduct ) => {
		if ( hasUpsell( slug as ProductSlug ) ) {
			page( getPathToUpsell( rootUrl, slug, duration as Duration, siteSlug ) );
			return;
		}

		checkout( siteSlug, slug );
	};

	const onDurationChange = ( newDuration: Duration ) => {
		if ( newDuration === duration ) {
			return;
		}

		const newProductSlug =
			newDuration === TERM_MONTHLY ? product.monthlyOptionSlug : product.annualOptionSlug;

		dispatch(
			recordTracksEvent( 'calypso_product_duration_change', {
				site_id: siteId || undefined,
				product_slug: newProductSlug,
				duration: newDuration,
			} )
		);
		page( getPathToDetails( rootUrl, newProductSlug as string, newDuration, siteSlug ) );
	};

	const { shortName } = product;
	const isBundle = [ OPTIONS_JETPACK_SECURITY, OPTIONS_JETPACK_SECURITY_MONTHLY ].includes(
		productSlug
	);
	const backButton = () => page( selectorPageUrl );

	return (
		<Main className="details__main" wideLayout>
			<QueryProducts />
			{ header }
			<HeaderCake onClick={ backButton }>
				{ isBundle ? translate( 'Plan Options' ) : translate( 'Product Options' ) }
			</HeaderCake>
			<FormattedHeader
				headerText={
					shortName
						? translate( 'Great choice! Now select a {{name/}} option:', {
								components: {
									name: <>{ shortName }</>,
								},
								comment: 'Short name of the selected generic plan or product',
						  } )
						: translate( 'Great choice! Now select an option:' )
				}
				brandFont
			/>
			<PlansFilterBar showDurations duration={ duration } onDurationChange={ onDurationChange } />
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
							<div key={ subtypeSlug } className="details__column">
								<ProductCard
									item={ subtypeItem }
									siteId={ siteId }
									currencyCode={ currencyCode as string }
									onClick={ () => selectProduct( subtypeItem ) }
								/>
							</div>
						);
					} )
				) }
			</div>
		</Main>
	);
};

export default withRedirectToSelector( DetailsPage );
