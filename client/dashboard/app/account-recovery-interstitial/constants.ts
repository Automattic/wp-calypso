/**
 * Account-recovery interstitial — shared constants.
 *
 * Phase 1: a single modal shown in the MSD to users with incomplete account-recovery
 * setup, nudging them to add a recovery method. No experiment, no alert variant — see
 * the plan (DOTOBRD-372). The experiment + alert arrive in Phase 2.
 */

/**
 * Feature flag gating the whole interstitial. Off in production until launch (PR 2);
 * enabled in development config so it can be exercised locally.
 */
export const RECOVERY_INTERSTITIAL_FLAG = 'dashboard/account-recovery-interstitial';

/**
 * User-meta key surfaced through /me/settings. Must match the backend allowlist and the
 * `saveableKeys` allowlist in `@automattic/api-core` (me-settings/mutators.ts). Holds a
 * unix timestamp (seconds) until which the interstitial is snoozed; 0/unset = not snoozed.
 */
export const RECOVERY_INTERSTITIAL_SNOOZE_META = 'account_recovery_interstitial_snoozed_until';

/**
 * QA override: append `?account-recovery-interstitial=force` to force the modal to show
 * regardless of eligibility (dev/QA only — the feature flag must still be on).
 */
export const RECOVERY_INTERSTITIAL_QA_PARAM = 'account-recovery-interstitial';

/**
 * How secure the user already is. Single source of truth for the tiers; SNOOZE_DAYS and
 * the copy map are both keyed by it, so adding a tier is a compile error until both update.
 */
export type SecurityLevel = 'none' | 'partial' | 'strong';

/**
 * Snooze windows (days) by security level — from i2. `strong` is unused in Phase 1
 * (fully-covered users aren't shown; a periodic re-check is deferred to Phase 2) but kept
 * for completeness and a single source of truth.
 */
export const SNOOZE_DAYS: Record< SecurityLevel, number > = {
	none: 14, // nothing set up
	partial: 30, // a recovery method but no 2FA
	strong: 365, // fully set up -> yearly periodic check (Phase 2)
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
