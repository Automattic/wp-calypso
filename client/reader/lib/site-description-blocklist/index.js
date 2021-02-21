const siteDescriptionBlocklist = new Set( [
	'Just another WordPress.com site',
	'Just another WordPress site',
	"This WordPress.com site is the bee's knees",
	"This WordPress site is the bee's knees",
	'A topnotch WordPress.com site',
	'A topnotch WordPress site',
] );

/**
 * Is the provided site description name blocked?
 *
 * @param {string} siteDescription Site description
 * @returns {boolean} True if blocked
 */
export const isSiteDescriptionBlocked = ( siteDescription ) => {
	return siteDescriptionBlocklist.has( siteDescription );
};
