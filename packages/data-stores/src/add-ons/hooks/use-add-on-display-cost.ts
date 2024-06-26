import { useTranslate } from 'i18n-calypso';
import * as ProductsList from '../../products-list';
import useAddOnPrices from './use-add-on-prices';

const useAddOnDisplayCost = ( productSlug: ProductsList.StoreProductSlug, quantity?: number ) => {
	const translate = useTranslate();
	const prices = useAddOnPrices( productSlug, quantity );
	const formattedCost = prices?.formattedMonthlyPrice || '';
	const productsList = ProductsList.useProducts( [ productSlug ] );
	const product = productsList.data?.[ productSlug ];
	if ( product?.term === 'month' ) {
		/* Translators: %(formattedCost)s: monthly price formatted with currency */
		return translate( '%(formattedCost)s/month, billed monthly', {
			args: {
				formattedCost,
			},
		} );
	}

	/* Translators: %(monthlyCost)s: monthly price formatted with currency */
	return translate( '%(monthlyCost)s/month, billed yearly', {
		args: {
			monthlyCost: formattedCost,
		},
	} );
};

export default useAddOnDisplayCost;
