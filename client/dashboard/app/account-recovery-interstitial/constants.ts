/**
 * Account-recovery interstitial — shared constants.
 */

/**
 * Feature flag gating the whole interstitial. Off in production until launch;
 * enabled in development config so it can be exercised locally.
 */
export const RECOVERY_INTERSTITIAL_FLAG = 'dashboard/account-recovery-interstitial';

/**
 * User-meta key surfaced through /me/settings. Holds a unix timestamp (seconds)
 * until which the interstitial is snoozed; 0/unset = not snoozed.
 */
export const RECOVERY_INTERSTITIAL_SNOOZE_META = 'account_recovery_interstitial_snoozed_until';

/**
 * QA override: append `?account-recovery-interstitial=force` to force the modal to show
 * regardless of eligibility. This will be removed before merging the code.
 */
export const RECOVERY_INTERSTITIAL_QA_PARAM = 'account-recovery-interstitial';

/**
 * How secure the user already is. Single source of truth for the tiers; SNOOZE_DAYS and
 * the copy map are both keyed by it, so adding a tier is a compile error until both update.
 */
export type SecurityLevel = 'none' | 'partial' | 'strong';

/**
 * Snooze windows (days) by security level
 */
export const SNOOZE_DAYS: Record< SecurityLevel, number > = {
	none: 14, // nothing set up
	partial: 30, // a recovery method but no 2FA or vice-versa
	strong: 365, // fully set up -> yearly periodic check
};

export const RECOVERY_INTERSTITIAL_TRACKS = {
	impression: 'calypso_account_recovery_interstitial_impression',
	ctaClick: 'calypso_account_recovery_interstitial_cta_click',
	dismiss: 'calypso_account_recovery_interstitial_dismiss',
} as const;

/** Where the CTAs send the user (MSD `/me/security` routes). */
export const RECOVERY_INTERSTITIAL_ROUTES = {
	accountRecovery: '/me/security/account-recovery',
	twoStepAuth: '/me/security/two-step-auth',
} as const;
