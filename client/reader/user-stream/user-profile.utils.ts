/**
 * Return the URL of the user profile page for a given user ID.
 *
 * Example: `/read/users/123`
 */
export function getUserProfileUrl( userId: number ): string {
	return `/read/users/${ userId }`;
}
