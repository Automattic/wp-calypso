/**
 * Return the URL of the user profile page for a given username.
 *
 * Example: `/reader/users/user_login`
 */
export function getUserProfileUrl( userLogin: string ): string {
	return `/reader/users/${ userLogin }`;
}
