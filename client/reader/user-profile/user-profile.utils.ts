/**
 * Return the URL of the user profile page for a given username.
 * This the preferred URL format for the user profile.
 *
 * Example: `/reader/users/user_login`
 */
export function getUserProfileUrlWithUsername( userLogin: string ): string {
	return `/reader/users/${ userLogin }`;
}

/**
 * Return the URL of the user profile page for a given user ID.
 * This an alternative URL format for the user profile.
 *
 * Example: `/reader/users/userId`
 */
export function getUserProfileUrlWithId( userId: string ): string {
	return `/reader/users/${ userId }`;
}

type UserProfileSubPage = '' | 'lists';

/**
 * Return the base path of the user profile page.
 */
export function getUserProfileBasePath( subPage: UserProfileSubPage = '' ): string {
	return subPage ? `/reader/users/:user_login/${ subPage }` : `/reader/users/:user_login`;
}
