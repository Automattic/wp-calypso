import { Domain, Product } from '@automattic/api-core';
import { IntervalLength, MailboxProvider } from '../types';
import { useEmailProduct } from './use-email-product';

const getAnnualSavings = ( monthlyProduct?: Product, annualProduct?: Product ) => {
	if ( ! monthlyProduct?.cost || ! annualProduct?.cost ) {
		return 0;
	}

	return 100 - ( annualProduct.cost * 100 ) / ( monthlyProduct.cost * 12 );
};

export const useAnnualSavings = ( domain?: Domain ) => {
	const { product: googleMonthlyProduct } = useEmailProduct(
		MailboxProvider.Google,
		IntervalLength.Monthly,
		domain
	);
	const { product: googleAnnualProduct } = useEmailProduct(
		MailboxProvider.Google,
		IntervalLength.Annually,
		domain
	);
	const googleAnnuallySavings = getAnnualSavings( googleMonthlyProduct, googleAnnualProduct );

	const { product: titanMonthlyProduct } = useEmailProduct(
		MailboxProvider.Titan,
		IntervalLength.Monthly,
		domain
	);
	const { product: titanAnnualProduct } = useEmailProduct(
		MailboxProvider.Titan,
		IntervalLength.Annually,
		domain
	);
	const titanAnnuallySavings = getAnnualSavings( titanMonthlyProduct, titanAnnualProduct );

	const bestAnnualSavings = Math.floor( Math.max( titanAnnuallySavings, googleAnnuallySavings ) );

	return {
		bestAnnualSavings,
	};
};
