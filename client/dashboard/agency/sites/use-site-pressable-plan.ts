import { getPressablePlanInfo } from '../marketplace/hosting/lib/pressable-plans';
import { useAgencyPressablePlan } from '../marketplace/use-agency-pressable-plan';

/**
 * The agency's Pressable plan as its Pressable sites show it, in the Sites list
 * and on the site overview. `plan` and `planInfo` are unset without a Pressable
 * plan bought through A4A, and the site then shows its own plan.
 */
export function useSitePressablePlan() {
	const { plan, licenses, products, isReady } = useAgencyPressablePlan();
	const planInfo = plan ? getPressablePlanInfo( plan ) : undefined;

	return {
		plan: planInfo ? plan : undefined,
		planInfo,
		licenses,
		products,
		isReady,
	};
}
