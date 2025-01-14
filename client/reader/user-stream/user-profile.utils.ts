import config from '@automattic/calypso-config';

/**
 * Return `true` if the user profile feature is enabled.
 */
export function isUserProfileEnabled(): boolean {
	return config.isEnabled( 'reader/user-profile' );
}

/**
 * Return the URL of the user profile page for a given user ID.
 *
 * Example: `/read/users/123`
 */
export function getUserProfileUrl( userId: number ): string {
	return `/read/users/${ userId }`;
}
