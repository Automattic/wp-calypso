/**
 * Is the provided author name blacklisted?
 *
 * @param {string} authorName Author name
 * @returns {boolean} True if blacklisted
 */
export const isAuthorNameBlacklisted = ( authorName: string ) =>
	!! authorName && 'admin' === authorName.toLowerCase();
