import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import {
	getProductDisplayCost,
	isProductsListFetching,
	getProductsList,
} from 'calypso/state/products-list/selectors';

export const PluginPrice = ( { plugin, billingPeriod, children } ) => {
	const translate = useTranslate();
	const variationPeriod = getPeriodVariationValue( billingPeriod );
	const productList = useSelector( getProductsList );

	const priceSlug = useMemo( () => {
		let productSlug = plugin?.variations?.[ variationPeriod ]?.product_slug;
		if ( productSlug ) return productSlug;

		const variationProductId = plugin?.variations?.[ variationPeriod ]?.product_id;
		productSlug = getProductSlugfromProductId( variationProductId, productList );
		return productSlug;
	}, [ plugin?.variations, productList, variationPeriod ] );

	const price = useSelector( ( state ) => getProductDisplayCost( state, priceSlug ) );
	const isFetching = useSelector( isProductsListFetching );

	const getPeriodText = ( periodValue ) => {
		switch ( periodValue ) {
			case 'monthly':
				return translate( 'monthly' );
			case 'yearly':
				return translate( 'per year' );
			default:
				return '';
		}
	};

	return children( {
		isFetching,
		price,
		period: getPeriodText( variationPeriod ),
	} );
};

export function getPeriodVariationValue( billingPeriod ) {
	switch ( billingPeriod ) {
		case IntervalLength.MONTHLY:
			return 'monthly';
		case IntervalLength.ANNUALLY:
			return 'yearly';

		default:
			return '';
	}
}

function getProductSlugfromProductId( productId, productList ) {
	if ( productId === undefined ) return undefined;

	const productSlug = Object.values( productList ).find(
		( product ) => product.product_id === productId
	)?.product_slug;
	return productSlug;
}
