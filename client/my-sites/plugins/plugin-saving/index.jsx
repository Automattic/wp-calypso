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
		return productMonthly && productYearly
			? formatCurrency(
					Math.round( productMonthly.cost * 12 - productYearly.cost ),
					productYearly.currency_code
			  )
			: null;
	};

	return children( {
		isFetching,
		saving: getAnnualPriceSavingText(),
	} );
};

export const PluginAnnualSavingPercent = ( { plugin, children } ) => {
	const priceSlugYearly = plugin?.variations?.yearly?.product_slug;
	const productYearly = useSelector( ( state ) => getProductBySlug( state, priceSlugYearly ) );
	const priceSlugMonthly = plugin?.variations?.monthly?.product_slug;
	const productMonthly = useSelector( ( state ) => getProductBySlug( state, priceSlugMonthly ) );
	const isFetching = useSelector( isProductsListFetching );

	const getAnnualPriceSavingText = () => {
		return productMonthly && productYearly
			? Math.floor( 100 - ( productYearly.cost * 100 ) / ( productMonthly.cost * 12 ) )
			: null;
	};

	return children( {
		isFetching,
		saving: getAnnualPriceSavingText(),
	} );
};
