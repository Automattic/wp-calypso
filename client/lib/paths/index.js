/**
 * Internal dependencies
 */
import { login } from './login';

function editorPathFromSite( site ) {
	let path = '',
		siteSlug;

	if ( site ) {
		siteSlug = ( typeof site === 'object' ) ? site.slug : site;
		path = '/' + siteSlug;
	} else if ( site && typeof site === 'object' ) {
		path = '/' + site.ID + '/new';
	}

	return path;
}

/**
 * Returns a URL to the post editor for a new post on a given site.
 *
 * @param  {object|string} site Site object or site slug
 * @return {string}      URL to post editor
 */
function newPost( site ) {
	const sitePath = editorPathFromSite( site );
	return '/post' + sitePath;
}

/**
 * Returns a URL to the editor for a new page on a given site.
 *
 * @param  {object|string} site Site object or site slug
 * @return {string}      URL to page editor
 */
function newPage( site ) {
	const sitePath = editorPathFromSite( site );
	return '/page' + sitePath;
}

/**
 * Returns a URL to manage Publicize connections for a given site.
 *
 * @param  {object} site Site object
 * @return {string}      URL to manage Publicize connections
 */
function publicizeConnections( site ) {
	let url = '/sharing';

	if ( site ) {
		url += '/' + site.slug;
	}

	return url;
}

/**
 * Returns a URL to manage Jetpack modules for a given site.
 *
 * @param  {object} site 	Site object
 * @param  {string} module	Optional module name to link to
 * @return {string}      	URL to manage Jetpack modules
 */
function jetpackModules( site, module ) {
	let url = '';
	if ( ! site.jetpack ) {
		return url;
	}

	url = site.options.admin_url + 'admin.php?page=jetpack_modules';
	if ( module ) {
		url += '&info=' + module;
	}

	return url;
}

export default {
	jetpackModules,
	login,
	newPost,
	newPage,
	publicizeConnections,
};
