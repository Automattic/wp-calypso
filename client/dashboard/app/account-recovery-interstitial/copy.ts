/**
 * Copy for the account-recovery interstitial, keyed by security level.
 *
 * ⚠️ Placeholder strings — final copy lives in the copy spreadsheet (plan §3a / §8 #?).
 * Swap these for the approved strings before launch; do not invent additional copy.
 *
 * Returned from a function (not a module-level constant) so `__()` runs with the active
 * locale at render time.
 */
import { __ } from '@wordpress/i18n';
import type { SecurityLevel } from './constants';

export interface InterstitialCopy {
	title: string;
	description: string;
	primaryCta: string;
	dismissCta: string;
}

export function getInterstitialCopy(): Record< SecurityLevel, InterstitialCopy > {
	return {
		none: {
			title: __( 'Add a recovery method in case you get locked out' ),
			description: __(
				'You don’t have a way to recover your account if you lose access. Add a recovery email or phone number so you can always get back in.'
			),
			primaryCta: __( 'Add a recovery method' ),
			dismissCta: __( 'Remind me later' ),
		},
		partial: {
			title: __( 'Protect your account with two-step authentication' ),
			description: __(
				'Add two-step authentication for an extra layer of security, so only you can access your account.'
			),
			primaryCta: __( 'Enable two-step authentication' ),
			dismissCta: __( 'Remind me later' ),
		},
		// Not shown in Phase 1 (fully-covered users are excluded); kept for type completeness.
		strong: {
			title: __( 'Review your account recovery options' ),
			description: __(
				'It’s a good time to check that your recovery email, phone number, and two-step authentication are still up to date.'
			),
			primaryCta: __( 'Review recovery options' ),
			dismissCta: __( 'Remind me later' ),
		},
	};
}
