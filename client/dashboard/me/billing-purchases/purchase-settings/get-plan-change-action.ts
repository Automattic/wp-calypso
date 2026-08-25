import { __ } from '@wordpress/i18n';
import { getWpcomPlanChangeTarget } from '../../../utils/site-url';
import type { WpcomPlanChangeInput, WpcomPlanChangeTarget } from '../../../utils/site-url';
import type { Purchase } from '@automattic/api-core';

export interface PlanChangeAction extends WpcomPlanChangeTarget {
	title: string;
	description: string;
}

export type PlanChangeActionInput = WpcomPlanChangeInput;

/**
 * The single "pick a different plan" action for a WordPress.com plan, shared by
 * the dashboard and legacy manage-purchase screens so the label and the
 * destination can't disagree. Returns `null` when there is no such action to
 * offer.
 *
 * Callers are responsible for checking that the user has permission to perform
 * the action.
 */
export function getPlanChangeAction(
	purchase: Purchase,
	input: PlanChangeActionInput
): PlanChangeAction | null {
	const target = getWpcomPlanChangeTarget( purchase, input );
	if ( ! target ) {
		return null;
	}

	return target.offersDowngrades
		? {
				...target,
				title: __( 'Change plan' ),
				description: __( 'Upgrade or downgrade to a plan that works for you.' ),
		  }
		: {
				...target,
				title: __( 'Upgrade plan' ),
				description: __( 'Find the best fit for your needs.' ),
		  };
}
