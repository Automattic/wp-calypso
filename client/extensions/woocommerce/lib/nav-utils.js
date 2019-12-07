/** @format */

/* Returns a string with :site replaced with the site.slug
 *
 * @param {String} path Relative or absolute URL with :site in it.
 * @param {Object} site Site object. We need just the slug (string) from it.
 * @return {String} URL with site.
 */
export const getLink = ( path, site ) => {
	if ( ! site || ! site.slug ) {
		return '#unknownsite';
	}
	return path.replace( ':site', site.slug );
};

/* Returns the origin for the current browser window
 *
 * @return {String} origin for the current browser window, wordpress.com by default
 */
export const getOrigin = () => {
	let origin = 'https://wordpress.com';
	if ( 'undefined' !== typeof window && window.location ) {
		origin = `${ window.location.protocol }//${ window.location.hostname }`;
	}

	if ( window.location.port ) {
		origin += `:${ window.location.port }`;
	}

	return origin;
};
