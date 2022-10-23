import formatCurrency from '@automattic/format-currency';
import { useSelector } from 'react-redux';
import { getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import {
	getProductBySlug,
	isProductsListFetching,
	getProductsList,
} from 'calypso/state/products-list/selectors';

export const PluginAnnualSaving = ( { plugin, children } ) => {
	const productList = useSelector( getProductsList );

	const variationYearly = plugin?.variations?.yearly;
	const priceSlugYearly = getProductSlugByPeriodVariation( variationYearly, productList );
	const productYearly = useSelector( ( state ) => getProductBySlug( state, priceSlugYearly ) );

	const variationMonthly = plugin?.variations?.monthly;
	const priceSlugMonthly = getProductSlugByPeriodVariation( variationMonthly, productList );
	const productMonthly = useSelector( ( state ) => getProductBySlug( state, priceSlugMonthly ) );
	const isFetching = useSelector( isProductsListFetching );

	const getAnnualPriceSavingText = () => {
		const totalDiscount =
			productMonthly && productYearly
				? Math.round( productMonthly.cost * 12 - productYearly.cost )
				: null;
		return totalDiscount > 0 && formatCurrency( totalDiscount, productYearly.currency_code );
	};

	return children( {
		isFetching,
		saving: getAnnualPriceSavingText(),
	} );
};
