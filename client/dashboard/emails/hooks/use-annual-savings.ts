import { Product } from '@automattic/api-core';
import { useEmailProduct } from './use-email-product';

const getAnnualSavings = ( monthlyProduct: Product, annualProduct: Product ) =>
	100 - ( annualProduct.cost * 100 ) / ( monthlyProduct.cost * 12 );

export const useAnnualSavings = () => {
	const { product: googleMonthlyProduct } = useEmailProduct( 'google', 'monthly' );
	const { product: googleAnnualProduct } = useEmailProduct( 'google', 'annually' );
	const googleAnnuallySavings = getAnnualSavings( googleMonthlyProduct, googleAnnualProduct );

	const { product: titanMonthlyProduct } = useEmailProduct( 'titan', 'monthly' );
	const { product: titanAnnualProduct } = useEmailProduct( 'titan', 'annually' );
	const titanAnnuallySavings = getAnnualSavings( titanMonthlyProduct, titanAnnualProduct );

	const bestAnnualSavings = Math.floor( Math.max( titanAnnuallySavings, googleAnnuallySavings ) );

	return {
		bestAnnualSavings,
	};
};
