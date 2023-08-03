import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import useAddOnMonthlyCost from './use-add-on-monthly-cost';

const useAddOnDisplayCost = ( productSlug: string, quantity?: number ) => {
	const translate = useTranslate();
	const costData = useAddOnMonthlyCost( productSlug, quantity );
	const formattedCost = costData?.formattedCost || '';

	return useSelector( ( state ) => {
		const product = getProductBySlug( state, productSlug );

		if ( product?.product_term === 'month' ) {
			return translate( '%(formattedCost)s/month, billed monthly', {
				/* Translators: $formattedCost: monthly price formatted with currency */
				args: {
					formattedCost,
				},
			} );
		}

		return translate( '%(monthlyCost)s/month, billed yearly', {
			/* Translators: $montlyCost: monthly price formatted with currency */
			args: {
				monthlyCost: formattedCost,
			},
		} );
	} );
};

export default useAddOnDisplayCost;
