import { __, sprintf } from '@wordpress/i18n';
import { formatDate } from '../../../utils/datetime';
import { getDowngradeTargetProductName } from '../../../utils/downgrade-target-name';
import type { Purchase } from '@automattic/api-core';

export interface DelayedDowngradeNotice {
	message: string;
	/**
	 * True when at least one renewal attempt has already failed, so the notice
	 * should also offer a way to fix the payment method.
	 */
	isRetryingRenewal: boolean;
}

/**
 * The persistent notice for a pending delayed downgrade, or null when none
 * should be shown.
 *
 * Once every scheduled auto-renewal attempt has passed there is nothing left
 * to carry out the downgrade, so no notice is returned and the expiry notice
 * is left to explain what is happening.
 */
export function getDelayedDowngradeNotice(
	purchase: Purchase,
	locale: string,
	hasEnTranslation: ( single: string ) => boolean
): DelayedDowngradeNotice | null {
	if ( ! purchase.is_delayed_downgrade_pending || purchase.is_past_last_auto_renew_attempt_date ) {
		return null;
	}

	const targetPlanName = getDowngradeTargetProductName(
		purchase.delayed_downgrade_to_product_slug
	);
	// `renew_date` is the next auto-renewal attempt date, which for annual
	// plans is up to 30 days before expiry. The downgrade takes effect on
	// that renewal, so it's the accurate date to show the customer.
	const renewalDate = purchase.renew_date
		? formatDate( new Date( purchase.renew_date ), locale, { dateStyle: 'long' } )
		: null;

	// Past the first attempt, at least one renewal has already failed. The
	// downgrade still happens at the next attempt whether or not its charge
	// succeeds. `renew_date` is day-granular and can be one attempt ahead on
	// an attempt day, so the copy says "by" rather than "on".
	if ( purchase.is_past_first_auto_renew_attempt_date && renewalDate ) {
		if (
			targetPlanName &&
			hasEnTranslation(
				'Your last renewal attempt didn’t go through. Your plan will change to %1$s by %2$s, when we next try to renew it.'
			)
		) {
			return {
				message: sprintf(
					// translators: %1$s is the name of the plan, e.g. "Personal"; %2$s is a date, e.g. "January 1, 2026"
					__(
						'Your last renewal attempt didn’t go through. Your plan will change to %1$s by %2$s, when we next try to renew it.'
					),
					targetPlanName,
					renewalDate
				),
				isRetryingRenewal: true,
			};
		}
		if (
			! targetPlanName &&
			hasEnTranslation(
				'Your last renewal attempt didn’t go through. Your plan will be downgraded by %s, when we next try to renew it.'
			)
		) {
			return {
				message: sprintf(
					// translators: %s is a date, e.g. "January 1, 2026"
					__(
						'Your last renewal attempt didn’t go through. Your plan will be downgraded by %s, when we next try to renew it.'
					),
					renewalDate
				),
				isRetryingRenewal: true,
			};
		}
	}

	return {
		message: getScheduledDowngradeMessage( targetPlanName, renewalDate ),
		isRetryingRenewal: false,
	};
}

function getScheduledDowngradeMessage(
	targetPlanName: string | null,
	renewalDate: string | null
): string {
	if ( targetPlanName && renewalDate ) {
		return sprintf(
			// translators: %1$s is the name of the plan, e.g. "Personal"; %2$s is a date, e.g. "January 1, 2026"
			__( 'Your plan is scheduled to downgrade to %1$s at your next renewal on %2$s.' ),
			targetPlanName,
			renewalDate
		);
	}
	if ( renewalDate ) {
		return sprintf(
			// translators: %s is a date, e.g. "January 1, 2026"
			__( 'Your plan is scheduled to downgrade at your next renewal on %s.' ),
			renewalDate
		);
	}
	if ( targetPlanName ) {
		return sprintf(
			// translators: %s is the name of the plan, e.g. "Personal"
			__( 'Your plan is scheduled to downgrade to %s at your next renewal.' ),
			targetPlanName
		);
	}
	return __( 'Your plan is scheduled to downgrade at your next renewal.' );
}
