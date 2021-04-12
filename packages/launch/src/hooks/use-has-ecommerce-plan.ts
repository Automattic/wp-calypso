/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, PLANS_STORE } from '../stores';

export function useHasEcommercePlan(): boolean {
	const locale = useLocale();

	const planProductId = useSelect(
		( select ) => select( LAUNCH_STORE ).getSelectedPlanProductId(),
		[]
	);

	const isEcommercePlan = useSelect(
		( select ) => {
			const plansStore = select( PLANS_STORE );
			const plan = plansStore.getPlanByProductId( planProductId, locale );
			return plansStore.isPlanEcommerce( plan?.periodAgnosticSlug );
		},
		[ planProductId, locale ]
	);

	return isEcommercePlan;
}
