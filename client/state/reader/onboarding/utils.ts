import { AppState } from 'calypso/types';

export const isProfileComplete = (
	settings: AppState[ 'userSettings' ][ 'settings' ],
	gravatarStatus: AppState[ 'gravatarStatus' ]
) =>
	settings.first_name &&
	settings.last_name &&
	settings.description &&
	gravatarStatus?.gravatarDetails?.has_gravatar;
