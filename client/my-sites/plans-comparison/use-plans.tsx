import {
	getPlan,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_STARTER,
	PLAN_WPCOM_PRO,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import isStarterPlanEnabled from './is-starter-plan-enabled';
import type { WPComPlan } from '@automattic/calypso-products';

export default function usePlans( hideFreePlan?: boolean ): WPComPlan[] {
	return useMemo(
		() =>
			[
				...( ! hideFreePlan && ! isStarterPlanEnabled() ? [ getPlan( PLAN_WPCOM_FLEXIBLE ) ] : [] ),
				...( isStarterPlanEnabled() ? [ getPlan( PLAN_WPCOM_STARTER ) ] : [] ),
				getPlan( PLAN_WPCOM_PRO ),
			] as WPComPlan[],
		[ hideFreePlan ]
	);
}
