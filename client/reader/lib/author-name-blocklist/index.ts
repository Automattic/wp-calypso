/**
 * Is the provided author name blocklisted?
 *
 * @param authorName - Author name
 * @returns True if blocklisted
 */
export const isAuthorNameBlocklisted = ( authorName: string ) =>
	!! authorName && 'admin' === authorName.toLowerCase();
