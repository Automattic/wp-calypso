import config from '@automattic/calypso-config';
import type { HostingDashboardOptIn } from '@automattic/api-core';

/**
 * Whether the user belongs to the percentage-rollout cohort. Membership is
 * derived from the user ID so it is stable across sessions and reproducible
 * in analytics queries; nothing is ever persisted.
 */
function isInRolloutCohort( userId: number | undefined ): boolean {
	return (
		config.isEnabled( 'dashboard/enable-percentage-rollout' ) &&
		userId !== undefined &&
		userId % 100 < 50
	);
}

type HostingDashboardEnrollment =
	| { enrolled: true; reason: 'opt-in' | 'forced' }
	| { enrolled: false };

/**
 * Is a user's default experience is the hosting dashboard, and why.
 */
export function getHostingDashboardEnrollment(
	preference: HostingDashboardOptIn | undefined,
	userId: number | undefined
): HostingDashboardEnrollment {
	// Support provided escape hatch, wins over everything.
	if ( preference?.value === 'forced-opt-out' ) {
		return { enrolled: false };
	}

	if ( preference?.value === 'opt-in' ) {
		return { enrolled: true, reason: 'opt-in' };
	}

	if ( preference?.value === 'forced-opt-in' || isInRolloutCohort( userId ) ) {
		return { enrolled: true, reason: 'forced' };
	}

	return { enrolled: false };
}

/**
 * Whether the user-facing opt-in toggle should be shown. Hidden for the
 * rollout cohort (the choice no longer exists) and for escape-hatched
 * users (their enrollment changes only via support tooling).
 */
export function isOptInToggleVisible(
	preference: HostingDashboardOptIn | undefined,
	userId: number | undefined
): boolean {
	// Useful for allowing internal testing for proxied a12s.
	if ( config.isEnabled( 'dashboard/force-opt-in-visibility' ) ) {
		return true;
	}

	if ( isInRolloutCohort( userId ) || preference?.value === 'forced-opt-out' ) {
		return false;
	}

	return true;
}
