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
import { RECOVERY_INTERSTITIAL_ROUTES } from './constants';
import type { SecurityLevel } from './constants';

export interface InterstitialCta {
	/** Tracks `cta_id` dimension. */
	id: string;
	label: string;
	/** MSD route the CTA navigates to. */
	route: string;
}

export interface InterstitialCopy {
	title: string;
	description: string;
	primaryCta: InterstitialCta;
	/** Optional second CTA, shown as an outline button under the primary one. */
	secondaryCta?: InterstitialCta;
}

export function getInterstitialCopy(): Record< SecurityLevel, InterstitialCopy > {
	const setUpRecoveryCta: InterstitialCta = {
		id: 'set_up_recovery',
		label: __( 'Set up recovery email or phone' ),
		route: RECOVERY_INTERSTITIAL_ROUTES.accountRecovery,
	};
	const addTwoFactorCta: InterstitialCta = {
		id: 'add_two_factor',
		label: __( 'Add 2FA and backup codes' ),
		route: RECOVERY_INTERSTITIAL_ROUTES.twoStepAuth,
	};

	return {
		none: {
			title: __( 'Add a way back into your account' ),
			description: __(
				'Set a recovery email or phone number so you don’t lose access to your account. It takes less than 2 minutes to set up.'
			),
			primaryCta: setUpRecoveryCta,
			secondaryCta: addTwoFactorCta,
		},
		partial: {
			title: __( 'Add an extra layer of protection' ),
			description: __(
				'Turn on two-step authentication and save your backup codes, so only you can get back into your account.'
			),
			primaryCta: addTwoFactorCta,
		},
		// Not shown in Phase 1 (fully-covered users are excluded); kept for type completeness.
		strong: {
			title: __( 'Review your account recovery options' ),
			description: __(
				'It’s a good time to check that your recovery email, phone number, and two-step authentication are still up to date.'
			),
			primaryCta: setUpRecoveryCta,
		},
	};
}
