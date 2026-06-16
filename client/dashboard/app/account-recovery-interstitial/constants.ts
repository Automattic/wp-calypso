/**
 * Account-recovery interstitial — shared constants.
 */

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
