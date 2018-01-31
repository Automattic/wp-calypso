/** @format */
/**
 * External Dependencies
 */
import { includes } from 'lodash';

const authorNameBlacklist = [ 'admin' ];

/**
 * Is the provided author name blacklisted?
 *
 * @param {string} authorName Author name
 * @returns {boolean} True if blacklisted
 */
export const isAuthorNameBlacklisted = authorName => {
	if ( ! authorName ) {
		return false;
	}

	return includes( authorNameBlacklist, authorName.toLowerCase() );
};
