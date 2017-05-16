/**
 * External Dependencies
 */
import { includes } from 'lodash';

const siteDescriptionBlacklist = [
	'Just another WordPress.com site',
	'Just another WordPress site',
];

/**
 * Is the provided site description name blacklisted?
 *
 * @param {string} siteDescription Site description
 * @returns {boolean} True if blacklisted
 */
export const isSiteDescriptionBlacklisted = siteDescription => {
	return includes( siteDescriptionBlacklist, siteDescription );
};
