import { JETPACK_MONTHLY_LEGACY_PLANS, JETPACK_YEARLY_LEGACY_PLANS } from './constants';
import type {
	JetpackLegacyPlanSlug,
	JetpackYearlyLegacyPlanSlug,
	JetpackMonthlyLegacyPlanSlug,
} from './types';
// eslint-disable-next-line no-restricted-imports
import type { Purchase } from 'calypso/lib/purchases/types';

export default function isJetpackLegacyTermUpgrade(
	itemSlug: string,
	purchases: Array< Purchase >[]
): itemSlug is JetpackLegacyPlanSlug {
	const purchaseSlugs = purchases.map( ( purchase: Purchase ) => {
		return purchase.product_slug;
	} );
	const monthlyLegacyPurchases = purchaseSlugs.filter( ( purchase_slug: string ) => {
		return JETPACK_MONTHLY_LEGACY_PLANS.includes( purchase_slug as JetpackMonthlyLegacyPlanSlug );
	} );

	// If the item the user is upgrading to is a yearly plan and they already have a monthly legacy plan
	// This is not perfect since it does not check if the monthly and yearly plan are of the same type, but it will cover most cases
	return (
		JETPACK_YEARLY_LEGACY_PLANS.includes( itemSlug as JetpackYearlyLegacyPlanSlug ) &&
		monthlyLegacyPurchases.length > 0
	);
}
