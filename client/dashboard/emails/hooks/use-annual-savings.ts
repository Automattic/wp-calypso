import { Product } from '@automattic/api-core';
import { IntervalLength, MailboxProvider } from '../types';
import { useEmailProduct } from './use-email-product';

const getAnnualSavings = ( monthlyProduct: Product, annualProduct: Product ) =>
	100 - ( annualProduct.cost * 100 ) / ( monthlyProduct.cost * 12 );

export const useAnnualSavings = () => {
	const { product: googleMonthlyProduct } = useEmailProduct(
		MailboxProvider.Google,
		IntervalLength.Monthly
	);
	const { product: googleAnnualProduct } = useEmailProduct(
		MailboxProvider.Google,
		IntervalLength.Annually
	);
	const googleAnnuallySavings = getAnnualSavings( googleMonthlyProduct, googleAnnualProduct );

	const { product: titanMonthlyProduct } = useEmailProduct(
		MailboxProvider.Titan,
		IntervalLength.Monthly
	);
	const { product: titanAnnualProduct } = useEmailProduct(
		MailboxProvider.Titan,
		IntervalLength.Annually
	);
	const titanAnnuallySavings = getAnnualSavings( titanMonthlyProduct, titanAnnualProduct );

	const bestAnnualSavings = Math.floor( Math.max( titanAnnuallySavings, googleAnnuallySavings ) );

	return {
		bestAnnualSavings,
	};
};
