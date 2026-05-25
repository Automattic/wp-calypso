import { type PlanSlug } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useState } from '@wordpress/element';
import useMaxDiscountsForPlanTerms from './use-max-discounts-for-plan-terms';

export default function useMaxDiscount(
	plans: PlanSlug[],
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase,
	siteId?: number | null
): number {
	const [ maxDiscount, setMaxDiscount ] = useState( 0 );
	const discounts = useMaxDiscountsForPlanTerms(
		plans,
		[ 'monthly', 'yearly' ],
		useCheckPlanAvailabilityForPurchase,
		siteId
	);
	const currentMaxDiscount = discounts[ 'yearly' ] ?? 0;

	if ( currentMaxDiscount > 0 && currentMaxDiscount !== maxDiscount ) {
		setMaxDiscount( currentMaxDiscount );
	}

	return currentMaxDiscount || maxDiscount;
}
