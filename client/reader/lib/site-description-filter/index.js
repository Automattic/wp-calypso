const disallowedSiteDescriptions = new Set( [
	'Just another WordPress.com site',
	'Just another WordPress site',
	"This WordPress.com site is the bee's knees",
	"This WordPress site is the bee's knees",
	'A topnotch WordPress.com site',
	'A topnotch WordPress site',
] );

/**
 * Is the provided site description disallowed?
 *
 * @param {string} siteDescription Site description
 * @returns {boolean} True if disallowed
 */
export const isSiteDescriptionDisallowed = ( siteDescription ) => {
	return disallowedSiteDescriptions.has( siteDescription );
};
