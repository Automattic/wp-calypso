import { getCalendarDaysUntil } from '../../utils/datetime';
import { isExpiredOrRemoved, mightStillAutoRenew } from '../../utils/purchase';
import { getExpiryStateName } from './get-plan-expiry-notice';
import type { PlanExpiryNoticeStage, PlanExpiryUrgency } from './get-plan-expiry-notice';
import type { Purchase } from '@automattic/api-core';

export interface PlanExpiryEventContext {
	/** Which page is recording the event, so the surfaces can be told apart. */
	surface: string;
	stage?: PlanExpiryNoticeStage;
	variant?: PlanExpiryUrgency;
	isPlanOwner: boolean;

	/** Extra properties for what only the caller knows, such as which page it is on. */
	extra?: Record< string, unknown >;
}

/**
 * The properties every plan-expiry event carries, so that an impression, a
 * click and a dismissal of the same notice line up in the data. The caller's
 * extras are spread first: the fields below are the ones the notice controls
 * and win a name collision.
 */
export function getPlanExpiryEventProperties(
	purchase: Purchase,
	{ surface, stage, variant, isPlanOwner, extra }: PlanExpiryEventContext
): Record< string, unknown > {
	const daysUntilExpiry = getCalendarDaysUntil( new Date( purchase.expiry_date ) );

	return {
		...extra,
		surface,
		purchase_id: purchase.ID,
		product_slug: purchase.product_slug,
		status: isExpiredOrRemoved( purchase ) ? 'expired' : 'active',
		days_until_expiry: daysUntilExpiry,
		days_remaining: daysUntilExpiry,
		might_still_auto_renew: mightStillAutoRenew( purchase ),
		variant,
		stage,
		state: stage ? getExpiryStateName( stage ) : undefined,
		is_plan_owner: isPlanOwner,
	};
}
