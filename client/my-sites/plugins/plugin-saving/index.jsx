import formatCurrency from '@automattic/format-currency';
import { useSelector } from 'react-redux';
import { getProductBySlug, isProductsListFetching } from 'calypso/state/products-list/selectors';

export const PluginAnnualSaving = ( { plugin, children } ) => {
	const priceSlugYearly = plugin?.variations?.yearly?.product_slug;
	const productYearly = useSelector( ( state ) => getProductBySlug( state, priceSlugYearly ) );
	const priceSlugMonthly = plugin?.variations?.monthly?.product_slug;
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
