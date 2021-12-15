import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import {
	getProductDisplayCost,
	isProductsListFetching as getIsProductsListFetching,
} from 'calypso/state/products-list/selectors';

export const PluginPrice = ( { plugin, children } ) => {
	const translate = useTranslate();
	const period = 'monthly'; // TODO: get period data from state
	const priceSlug = plugin?.variations?.[ period ]?.product_slug;
	const price = useSelector( ( state ) => getProductDisplayCost( state, priceSlug ) );
	const isFetching = useSelector( getIsProductsListFetching );

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
		period: getPeriodText( period ),
	} );
};
