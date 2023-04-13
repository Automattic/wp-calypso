import { isWpComAnnualPlan, isWpComMonthlyPlan } from '@automattic/calypso-products';
import { sprintf, __ } from '@wordpress/i18n';
import { BlockPlan } from './pricing-plans';

const getAnnualDiscount = ( annualPlan?: BlockPlan, monthlyPlan?: BlockPlan ) => {
	if ( ! annualPlan || ! monthlyPlan ) {
		return null;
	}

	const annualPricePerMonth = annualPlan.rawPrice / 12;

	const discountRate = Math.round(
		( 100 * ( monthlyPlan.rawPrice - annualPricePerMonth ) ) / monthlyPlan.rawPrice
	);

	return sprintf(
		// translators: %s is the discount rate
		__( 'Save %s', 'happy-blocks' ),
		`${ discountRate }%`
	);
};

const usePlanVariants = ( plans: BlockPlan[], selectedPlan: BlockPlan ) => {
	const monthlyPlan = isWpComMonthlyPlan( selectedPlan.productSlug )
		? selectedPlan
		: plans.find(
				( plan ) => isWpComMonthlyPlan( plan.productSlug ) && plan.type === selectedPlan.type
		  );

	const annualPlan = isWpComAnnualPlan( selectedPlan.productSlug )
		? selectedPlan
		: plans.find(
				( plan ) => isWpComAnnualPlan( plan.productSlug ) && plan.type === selectedPlan.type
		  );

	const annualDiscount = getAnnualDiscount( annualPlan, monthlyPlan );

	return { monthlyPlan, annualPlan, annualDiscount };
};

export default usePlanVariants;
