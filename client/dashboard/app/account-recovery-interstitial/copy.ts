/**
 * Copy for the account-recovery interstitial, keyed by security level.
 *
 * ⚠️ Placeholder strings — final copy lives in the copy spreadsheet (plan §3a / §8 #?).
 * Swap these for the approved strings before launch; do not invent additional copy.
 *
 * Returned from a function (not a module-level constant) so `__()` runs with the active
 * locale at render time, and so the `strong` description can interpolate the user's
 * (masked) recovery details.
 */
import { __, sprintf } from '@wordpress/i18n';
import { RECOVERY_INTERSTITIAL_ROUTES } from './constants';
import type { SecurityLevel } from './constants';

export interface InterstitialCta {
	/** Tracks `cta_id` dimension. */
	id: string;
	label: string;
	/** MSD route the CTA navigates to. Omitted for a confirm-and-dismiss action. */
	route?: string;
}

export interface InterstitialCopy {
	title: string;
	description: string;
	primaryCta: InterstitialCta;
	/** Optional second CTA, shown as an outline button under the primary one. */
	secondaryCta?: InterstitialCta;
}

/** The user's validated recovery details, used to personalize the `strong` copy. */
export interface InterstitialCopyContext {
	recoveryEmail?: string;
	recoveryPhoneNumber?: string;
}

/** `joe@gmail.com` → `j••••@gmail.com`. */
function maskEmail( email: string ): string {
	const [ local, domain ] = email.split( '@' );
	if ( ! domain || ! local ) {
		return email;
	}
	return `${ local.charAt( 0 ) }••••@${ domain }`;
}

/** `5551234542` → `••42` (last two digits). */
function maskPhone( number: string ): string {
	const digits = number.replace( /\D/g, '' );
	return `••${ digits.slice( -2 ) }`;
}

function getStrongDescription( { recoveryEmail, recoveryPhoneNumber }: InterstitialCopyContext ) {
	const maskedEmail = recoveryEmail ? maskEmail( recoveryEmail ) : undefined;
	const maskedPhone = recoveryPhoneNumber ? maskPhone( recoveryPhoneNumber ) : undefined;

	if ( maskedEmail && maskedPhone ) {
		return sprintf(
			// translators: %1$s is a masked recovery email (e.g. j••••@gmail.com); %2$s is the last digits of a recovery phone number (e.g. ••42).
			__(
				'Make sure your recovery options are up to date so you’re never locked out. We currently have %1$s and the phone number ending in %2$s.'
			),
			maskedEmail,
			maskedPhone
		);
	}
	if ( maskedEmail ) {
		return sprintf(
			// translators: %s is a masked recovery email (e.g. j••••@gmail.com).
			__(
				'Make sure your recovery options are up to date so you’re never locked out. We currently have %s.'
			),
			maskedEmail
		);
	}
	if ( maskedPhone ) {
		return sprintf(
			// translators: %s is the last digits of a recovery phone number (e.g. ••42).
			__(
				'Make sure your recovery options are up to date so you’re never locked out. We currently have the phone number ending in %s.'
			),
			maskedPhone
		);
	}
	return __( 'Make sure your recovery options are up to date so you’re never locked out.' );
}

export function getInterstitialCopy(
	context: InterstitialCopyContext = {}
): Record< SecurityLevel, InterstitialCopy > {
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
		strong: {
			title: __( 'Still have access to these?' ),
			description: getStrongDescription( context ),
			// No route: a positive confirmation that snoozes for the yearly window.
			primaryCta: {
				id: 'confirm_recovery',
				label: __( 'Yes, all good' ),
			},
			secondaryCta: {
				id: 'update_recovery',
				label: __( 'Update recovery information' ),
				route: RECOVERY_INTERSTITIAL_ROUTES.accountRecovery,
			},
		},
	};
}
