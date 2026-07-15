import config from '@automattic/calypso-config';
import { isSupportSession } from '@automattic/calypso-support-session';
import type { HostingDashboardOptIn } from '@automattic/api-core';

const ROLLOUT_PERCENTAGE = 50;

// When rollout begins, users registered after this ID (i.e. new users) are enrolled.
const NEW_USER_ID_THRESHOLD = 282742932;

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
 * limited to enrolled users who did not earlier opt in. Can't use the existing
 * `isInRolloutCohort` logic because semantics are slightly different: even
 * users who have been "forced" do not see modal if they have previously opt'd in.
 */
export function isWelcomeModalEligible(
	preference: HostingDashboardOptIn | undefined,
	userId: number | undefined
): boolean {
	if (
		! config.isEnabled( 'dashboard/opt-in-welcome-modal' ) ||
		! userId ||
		userId > NEW_USER_ID_THRESHOLD ||
		preference?.value === 'opt-in' ||
		isSupportSession()
	) {
		return false;
	}

	return userId % 100 < ROLLOUT_PERCENTAGE;
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
