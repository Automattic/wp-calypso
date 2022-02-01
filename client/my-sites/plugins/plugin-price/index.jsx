import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import {
	getProductDisplayCost,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';

export const PluginPrice = ( { plugin, billingPeriod, children } ) => {
	const translate = useTranslate();
	const variationPeriod = getPeriodVariationValue( billingPeriod );
	const priceSlug = plugin?.variations?.[ variationPeriod ]?.product_slug;
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
