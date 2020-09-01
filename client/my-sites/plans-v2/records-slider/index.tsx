/**
 * External dependencies
 */
import formatCurrency from '@automattic/format-currency';
import { useTranslate, numberFormat } from 'i18n-calypso';
import React, { useState, useCallback, useEffect, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import useItemPrice from '../use-item-price';
import { slugToSelectorProduct } from '../utils';
import Range from 'components/forms/range';
import { getJetpackSearchTierByRecords } from 'lib/products-values';
import {
	JETPACK_SEARCH_TIER_UP_TO_100_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS,
	JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS,
	JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS,
} from 'lib/products-values/constants';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getAvailableProductsBySiteId } from 'state/sites/products/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

type Props = {
	productSlug: string;
};

const PRODUCT_TIERS_PRICES: Record< string, number > = {
	[ JETPACK_SEARCH_TIER_UP_TO_100_RECORDS ]: 5,
	[ JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS ]: 10,
	[ JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS ]: 25,
	[ JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS ]: 60,
	[ JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS ]: 200,
	[ JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS ]: 200,
};
const PRODUCT_TIERS = Object.keys( PRODUCT_TIERS_PRICES );

const getTierIndex = ( recordCount: number ): number =>
	Math.max( PRODUCT_TIERS.indexOf( getJetpackSearchTierByRecords( recordCount ) as string ), 0 );

const RecordsSlider: FunctionComponent< Props > = ( { productSlug } ) => {
	const selectorProduct = slugToSelectorProduct( productSlug );

	const translate = useTranslate();
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const products = useSelector(
		( state ) => siteId && getAvailableProductsBySiteId( state, siteId )
	)?.data;
	const { isFetching, originalPrice, discountedPrice } = useItemPrice(
		siteId,
		selectorProduct,
		selectorProduct?.monthlyProductSlug
	);

	const searchProduct = products?.[ productSlug ];
	const recordCount = searchProduct?.price_tier_usage_quantity;
	const [ tier, setTier ] = useState( getTierIndex( recordCount ) );
	const handleChange = useCallback( ( e ) => setTier( e.target.value ), [ setTier ] );

	useEffect( () => {
		if ( recordCount >= 0 ) {
			setTier( getTierIndex( recordCount ) );
		}
	}, [ recordCount ] );

	if ( ! searchProduct || ! selectorProduct || ! currencyCode || isFetching ) {
		return null;
	}

	const productPrice = discountedPrice || originalPrice;
	const tierSlug = PRODUCT_TIERS[ tier ];
	const tierPrice = PRODUCT_TIERS_PRICES[ tierSlug ];
	const formattedTierPrice = formatCurrency( tierPrice, currencyCode, {
		precision: 2,
		stripZeros: true,
	} ) as string;

	let tierText;
	let costText = translate( '%s/month', {
		args: formattedTierPrice,
		comment: '%s is the monthly price',
	} );

	switch ( tierSlug ) {
		case JETPACK_SEARCH_TIER_UP_TO_100_RECORDS:
			tierText = translate( 'Up to 100 records' );
			break;
		case JETPACK_SEARCH_TIER_UP_TO_1K_RECORDS:
			tierText = translate( 'Up to 1,000 records' );
			break;
		case JETPACK_SEARCH_TIER_UP_TO_10K_RECORDS:
			tierText = translate( 'Up to 10,000 records' );
			break;
		case JETPACK_SEARCH_TIER_UP_TO_100K_RECORDS:
			tierText = translate( 'Up to 100,000 records' );
			break;
		case JETPACK_SEARCH_TIER_UP_TO_1M_RECORDS:
			tierText = translate( 'Up to 1,000,000 records' );
			break;
		case JETPACK_SEARCH_TIER_MORE_THAN_1M_RECORDS:
			tierText = translate( 'More than 1,000,000 records' );
			costText = translate( '%s/month per 1M records', {
				args: formattedTierPrice,
				comment: '%s is the monthly price',
			} );
			break;
	}

	return (
		<div className="records-slider">
			<p className="records-slider__tier">
				{ translate( 'Your site has %(recordCount)s records, %(cost)s/month', {
					args: {
						recordCount: numberFormat( recordCount, 0 ),
						cost: formatCurrency( productPrice, currencyCode, {
							precision: 2,
							stripZeros: true,
						} ),
					},
					comment:
						'%(recordCount)s is the number of search records of the site, %(cost)s the monthly cost of Jetpack Search',
				} ) }
			</p>
			<Range max={ PRODUCT_TIERS.length - 1 } value={ tier } onChange={ handleChange } />
			<p className="records-slider__label">
				{ tierText }:
				<br />
				{ costText }
			</p>
		</div>
	);
};

export default RecordsSlider;
