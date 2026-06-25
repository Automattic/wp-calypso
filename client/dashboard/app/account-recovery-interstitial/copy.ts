/**
 * Copy for the account-recovery interstitial, keyed by `InterstitialVariant`.
 */
import { __, sprintf } from '@wordpress/i18n';
import { securityAccountRecoveryRoute, securityTwoStepAuthRoute } from '../router/me';

/**
 * Which message to show in the interstitial, depending on account recovery settings.
 * Each of these variants map to a correspondent `SecurityLevel` ("none", "partial", "strong").
 */
export type InterstitialVariant =
	| 'none' // none
	| 'add-two-factor' // partial
	| 'add-recovery-method' // partial
	| 'add-backup-codes' // strong
	| 'strong'; // strong

export interface InterstitialCta {
	/** Tracks `cta_id` dimension. */
	id: string;
	label: string;
	/** MSD route the CTA navigates to. Omitted for a confirm-and-dismiss action. */
	route?: string;
}

interface InterstitialCopy {
	title: string;
	description: string;
	primaryCta: InterstitialCta;
	secondaryCta?: InterstitialCta;
}

/** Picks the copy variant depending on the user's account recovery settings. */
export function getInterstitialVariant(
	hasRecoveryMethod: boolean,
	hasTwoFactor: boolean,
	hasBackupCodes: boolean
): InterstitialVariant {
	if ( ! hasRecoveryMethod && ! hasTwoFactor ) {
		return 'none';
	}
	// Exactly one of recovery-method / 2FA is missing: nudge toward the missing one. A missing
	// recovery method outranks missing backup codes, so this is checked before backup codes.
	if ( ! hasTwoFactor ) {
		return 'add-two-factor';
	}
	if ( ! hasRecoveryMethod ) {
		return 'add-recovery-method';
	}
	// Has a recovery method and 2FA; the only remaining gap is downloading backup codes.
	if ( ! hasBackupCodes ) {
		return 'add-backup-codes';
	}
	return 'strong';
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

/** The "strong" SecurityLevel description varies depending on what account recovery methods are available. */
function getStrongDescription( {
	recoveryEmail,
	recoveryPhoneNumber,
}: {
	recoveryEmail?: string;
	recoveryPhoneNumber?: string;
} ) {
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

/** `recoveryMethods` carries the user's validated recovery details, to personalize the `strong` copy. */
export function getInterstitialCopy(
	recoveryMethods: { recoveryEmail?: string; recoveryPhoneNumber?: string } = {}
): Record< InterstitialVariant, InterstitialCopy > {
	return {
		// Nothing set up: lead with a recovery method, offer 2FA as the secondary.
		none: {
			title: __( 'Add a way back into your account' ),
			description: __(
				'Set a recovery email or phone number so you don’t lose access to your account. It takes less than 2 minutes to set up.'
			),
			primaryCta: {
				id: 'set_up_recovery',
				label: __( 'Set up recovery email or phone' ),
				route: securityAccountRecoveryRoute.fullPath,
			},
			secondaryCta: {
				id: 'add_two_factor',
				label: __( 'Add two-step authentication and backup codes' ),
				route: securityTwoStepAuthRoute.fullPath,
			},
		},
		// Has a recovery method, missing 2FA: push two-factor.
		'add-two-factor': {
			title: __( 'Take your security further' ),
			description: __(
				'Add an extra layer of security. Enable two-step authentication to go beyond email or phone recovery.'
			),
			primaryCta: {
				id: 'set_up_two_factor',
				label: __( 'Set up two-step authentication' ),
				route: securityTwoStepAuthRoute.fullPath,
			},
			secondaryCta: {
				id: 'review_recovery',
				label: __( 'Review recovery email or phone' ),
				route: securityAccountRecoveryRoute.fullPath,
			},
		},
		// Has 2FA, missing a recovery method: push a recovery email/phone safety net.
		'add-recovery-method': {
			title: __( 'Don’t get locked out of your account' ),
			description: __(
				'Two-step authentication is great—but if you lose access to your authenticator, you’ll need another way in. Add a recovery email or phone as a safety net.'
			),
			primaryCta: {
				id: 'set_up_recovery',
				label: __( 'Set up recovery email or phone' ),
				route: securityAccountRecoveryRoute.fullPath,
			},
			secondaryCta: {
				id: 'review_two_factor',
				label: __( 'Review two-step authentication and add backup codes' ),
				route: securityTwoStepAuthRoute.fullPath,
			},
		},
		// Has a recovery method and 2FA but hasn't downloaded backup codes: nudge that last step.
		// Both CTAs "review" rather than "set up" — everything else is already in place.
		'add-backup-codes': {
			title: __( 'Don’t get locked out of your account' ),
			description: __(
				'If you ever lose access to your authenticator, backup codes are your way back in. Download them now and keep them somewhere safe.'
			),
			primaryCta: {
				id: 'download_backup_codes',
				label: __( 'Review two-step authentication and download backup codes' ),
				route: securityTwoStepAuthRoute.fullPath,
			},
			secondaryCta: {
				id: 'review_recovery',
				label: __( 'Review recovery email or phone' ),
				route: securityAccountRecoveryRoute.fullPath,
			},
		},
		// Fully covered: yearly re-check of the recovery details already on file.
		strong: {
			title: __( 'Still have access to these?' ),
			description: getStrongDescription( recoveryMethods ),
			// No route: a positive confirmation that snoozes for the yearly window.
			primaryCta: {
				id: 'confirm_recovery',
				label: __( 'Yes, all good' ),
			},
			secondaryCta: {
				id: 'update_recovery',
				label: __( 'Update recovery information' ),
				route: securityAccountRecoveryRoute.fullPath,
			},
		},
	};
}
