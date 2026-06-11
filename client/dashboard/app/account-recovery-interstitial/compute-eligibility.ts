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

	// Every user is nudged once their snooze (if any) has elapsed. Incomplete setups
	// (`none`/`partial`) are prompted to add a method; fully-covered (`strong`) users get a
	// yearly periodic re-check via the 365-day snooze window (SNOOZE_DAYS.strong).
	const isEligible = isLoaded && ! isSnoozed;

	return { isEligible, securityLevel, snoozeDays };
}
