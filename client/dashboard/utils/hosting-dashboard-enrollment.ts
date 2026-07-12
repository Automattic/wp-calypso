import config from '@automattic/calypso-config';
import { isSupportSession } from '@automattic/calypso-support-session';
import type { HostingDashboardOptIn } from '@automattic/api-core';

const ROLLOUT_PERCENTAGE = 50;

// When rollout begins, users registered after this ID (i.e. new users) are enrolled.
// TODO update on release day DOTMSD-1357
const NEW_USER_ID_THRESHOLD = Infinity;

/**
 * Whether the user belongs to the percentage-rollout cohort. Membership is
 * derived from the user ID so it is stable across sessions and reproducible
 * in analytics queries; nothing is ever persisted.
 */
function isInRolloutCohort( userId: number | undefined ): boolean {
	// Support sessions must see the user's real enrollment, so the full-rollout
	// simulation is ignored when assisting another user.
	if ( config.isEnabled( 'dashboard/simulate-full-rollout' ) && ! isSupportSession() ) {
		return true;
	}

	if ( userId === undefined ) {
		return false;
	}

	return (
		config.isEnabled( 'dashboard/enable-percentage-rollout' ) &&
		( userId % 100 < ROLLOUT_PERCENTAGE || userId > NEW_USER_ID_THRESHOLD )
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

	if ( preference?.value === 'forced-opt-in' || isInRolloutCohort( userId ) ) {
		return { enrolled: true, reason: 'forced' };
	}

	if ( preference?.value === 'opt-in' ) {
		return { enrolled: true, reason: 'opt-in' };
	}

	return { enrolled: false };
}

/**
 * Whether the opt-in welcome modal should be shown. The modal introduces the
 * dashboard to existing users who were moved onto it by the rollout, so it is
 * limited to enrolled users whose enrollment was forced. New users (who start
 * on the dashboard by default) and users who explicitly opted in (who are
 * already acquainted with it) are both excluded.
 */
export function isWelcomeModalEligible(
	preference: HostingDashboardOptIn | undefined,
	userId: number | undefined
): boolean {
	if ( ! userId || userId > NEW_USER_ID_THRESHOLD ) {
		return false;
	}

	const enrollment = getHostingDashboardEnrollment( preference, userId );
	return enrollment.enrolled && enrollment.reason === 'forced';
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
	// Ensures the toggle is visible in development for easier testing/dev.
	if ( config.isEnabled( 'dashboard/force-opt-in-visibility' ) ) {
		return true;
	}

	if ( isInRolloutCohort( userId ) || preference?.value === 'forced-opt-out' ) {
		return false;
	}

	return true;
}

/**
 * Whether the advanced notice should be visible for this user. Hidden for
 * escape-hatched users (forced opt-in or opt-out), whose enrollment changes
 * only via support tooling.
 */
export function isAdvancedNoticeVisible(
	preference: HostingDashboardOptIn | undefined,
	userId: number | undefined
): boolean {
	if ( preference?.value === 'forced-opt-in' || preference?.value === 'forced-opt-out' ) {
		return false;
	}

	return (
		config.isEnabled( 'dashboard/rollout-advance-notice' ) &&
		!! userId &&
		userId % 100 < ROLLOUT_PERCENTAGE
	);
}
