/**
 * Account-recovery interstitial — shared constants.
 */

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
