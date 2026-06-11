/**
 * Pure eligibility logic for the account-recovery interstitial.
 *
 * No React, no data fetching — the runtime fetches its own data and feeds booleans in.
 * This keeps the security-tier + snooze logic trivially unit-testable.
 */
import { SNOOZE_DAYS, type SecurityLevel } from './constants';

export interface EligibilityInput {
	/** True once all the feature's data sources have resolved. */
	isLoaded: boolean;
	/** A recovery email is set and validated. */
	hasRecoveryEmail: boolean;
	/** A recovery phone is set and validated. */
	hasRecoveryPhone: boolean;
	/** Two-step authentication is enabled. */
	hasTwoFactor: boolean;
	/** Unix seconds the interstitial is snoozed until (from user meta); undefined = never. */
	snoozeUntil: number | undefined;
	/** Current time in unix seconds, injected for testability. */
	now: number;
}

export interface EligibilityResult {
	isEligible: boolean;
	securityLevel: SecurityLevel;
	/** SNOOZE_DAYS[ securityLevel ] — the window to apply when the user snoozes. */
	snoozeDays: number;
}

export function getSecurityLevel(
	hasRecoveryEmail: boolean,
	hasRecoveryPhone: boolean,
	hasTwoFactor: boolean
): SecurityLevel {
	const hasRecoveryMethod = hasRecoveryEmail || hasRecoveryPhone;

	if ( ! hasRecoveryMethod && ! hasTwoFactor ) {
		return 'none';
	}

	if ( hasRecoveryMethod && hasTwoFactor ) {
		return 'strong';
	}

	return 'partial';
}

export function computeEligibility( {
	isLoaded,
	hasRecoveryEmail,
	hasRecoveryPhone,
	hasTwoFactor,
	snoozeUntil,
	now,
}: EligibilityInput ): EligibilityResult {
	const securityLevel = getSecurityLevel( hasRecoveryEmail, hasRecoveryPhone, hasTwoFactor );
	const snoozeDays = SNOOZE_DAYS[ securityLevel ];
	const isSnoozed = !! snoozeUntil && now < snoozeUntil;

	// Phase 1 only nudges users whose recovery setup is incomplete (`none`/`partial`).
	// Fully-covered (`strong`) users are not shown — a yearly periodic re-check is deferred
	// to Phase 2.
	const isEligible = isLoaded && securityLevel !== 'strong' && ! isSnoozed;

	return { isEligible, securityLevel, snoozeDays };
}
