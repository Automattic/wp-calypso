/**
 * Internal dependencies
 */
export { login } from './login';

function editorPathFromSite( site ) {
	if ( ! site ) {
		return '';
	}

	const siteSlug = typeof site === 'object' ? site.slug : site;
	return '/' + siteSlug;
}

/**
 * Returns a URL to the post editor for a new post on a given site.
 *
 * @param  {object|string} site Site object or site slug
 * @returns {string}      URL to post editor
 */
export function newPost( site ) {
	const sitePath = editorPathFromSite( site );
	return '/post' + sitePath;
}

/**
 * Returns a URL to the editor for a new page on a given site.
 *
 * @param  {object|string} site Site object or site slug
 * @returns {string}      URL to page editor
 */
export function newPage( site ) {
	const sitePath = editorPathFromSite( site );
	return '/page' + sitePath;
}

/**
 * Returns a URL to manage Publicize connections for a given site.
 *
 * @param  {object} site Site object
 * @returns {string}      URL to manage Publicize connections
 */
export function publicizeConnections( site ) {
	let url = '/marketing/connections';

	if ( site ) {
		url += '/' + site.slug;
	}

	return url;
}
