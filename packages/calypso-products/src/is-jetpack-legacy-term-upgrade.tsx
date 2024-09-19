import { JETPACK_MONTHLY_LEGACY_PLANS, JETPACK_YEARLY_LEGACY_PLANS } from './constants';
import type {
	JetpackLegacyPlanSlug,
	JetpackYearlyLegacyPlanSlug,
	JetpackMonthlyLegacyPlanSlug,
} from './types';

export default function isJetpackLegacyTermUpgrade(
	itemSlug: string,
	upgradeFrom: string
): itemSlug is JetpackLegacyPlanSlug {
	// If the item the user is upgrading to is a yearly plan and they already have a monthly legacy plan
	// This is not perfect since it does not check if the monthly and yearly plan are of the same type, but it will cover most cases
	return (
		JETPACK_YEARLY_LEGACY_PLANS.includes( itemSlug as JetpackYearlyLegacyPlanSlug ) &&
		JETPACK_MONTHLY_LEGACY_PLANS.includes( upgradeFrom as JetpackMonthlyLegacyPlanSlug )
	);
}
