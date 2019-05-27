/**
 * Is the provided author name blacklisted?
 *
 * @param authorName - Author name
 * @returns True if blacklisted
 */
export const isAuthorNameBlacklisted = ( authorName: string ) =>
	!! authorName && 'admin' === authorName.toLowerCase();
