import { formatCurrency } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import {
	getProductBySlug,
	isProductsListFetching,
	getProductsList,
} from 'calypso/state/products-list/selectors';
import type { ReactNode } from 'react';

export const PluginAnnualSaving = ( {
	plugin,
	renderContent,
}: {
	plugin?: {
		variations?: {
			yearly?: { product_slug?: string | undefined; product_id?: number | undefined };
			monthly?: { product_slug?: string | undefined; product_id?: number | undefined };
		};
	};
	renderContent: ( {
		isFetching,
		saving,
	}: {
		isFetching: boolean;
		saving: string | false | 0 | null;
	} ) => ReactNode;
} ) => {
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
		return (
			totalDiscount &&
			productYearly &&
			totalDiscount > 0 &&
			formatCurrency( totalDiscount, productYearly.currency_code )
		);
	};

	return renderContent( {
		isFetching,
		saving: getAnnualPriceSavingText(),
	} );
};
