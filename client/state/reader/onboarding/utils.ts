import { AppState } from 'calypso/types';

/**
 * Determines if a user's profile is complete for Reader onboarding.
 * We consider the profile complete if ANY field is filled or if they have a Gravatar.
 * This relaxed criteria encourages users to proceed with Reader onboarding
 * while still ensuring they've made at least one meaningful profile customization.
 * Previously, ALL fields were required, which created unnecessary friction in the onboarding flow.
 */
export const isProfileComplete = (
	settings: AppState[ 'userSettings' ][ 'settings' ],
	gravatarStatus: AppState[ 'gravatarStatus' ]
) =>
	!! (
		settings.first_name ||
		settings.last_name ||
		settings.description ||
		gravatarStatus?.gravatarDetails?.has_gravatar
	);
