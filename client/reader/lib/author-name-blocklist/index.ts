/**
 * Is the provided author name blocked?
 *
 * @param authorName - Author name
 * @returns True if blocked
 */
export const isAuthorNameBlocked = ( authorName: string ) =>
	!! authorName && 'admin' === authorName.toLowerCase();
