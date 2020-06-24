/**
 * Is the provided author name disallowed?
 *
 * @param authorName - Author name
 * @returns True if disallowed
 */
export const isAuthorNameDisallowed = ( authorName: string ) =>
	!! authorName && 'admin' === authorName.toLowerCase();
