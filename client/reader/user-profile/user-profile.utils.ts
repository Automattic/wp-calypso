import config from '@automattic/calypso-config';

/**
 * Return `true` if the user profile feature is enabled.
 */
export function isUserProfileEnabled(): boolean {
	return config.isEnabled( 'reader/user-profile' );
}

/**
 * Return the URL of the user profile page for a given username.
 *
 * Example: `/reader/users/user_login`
 */
export function getUserProfileUrl( userLogin: string ): string {
	return `/reader/users/${ userLogin }`;
}

type UserProfileSubPage = '' | 'lists';

/**
 * Return the base path of the user profile page.
 */
export function getUserProfileBasePath( subPage: UserProfileSubPage = '' ): string {
	return subPage ? `/reader/users/:user_login/${ subPage }` : `/reader/users/:user_login`;
}
