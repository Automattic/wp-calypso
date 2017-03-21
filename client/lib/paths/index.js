function editorPathFromSite( site ) {
	var path = '',
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
export const newPost = function( site ) {
	var sitePath = editorPathFromSite( site );
	return '/post' + sitePath;
};

/**
 * Returns a URL to the editor for a new page on a given site.
 *
 * @param  {object|string} site Site object or site slug
 * @return {string}      URL to page editor
 */
export const newPage = function( site ) {
	var sitePath = editorPathFromSite( site );
	return '/page' + sitePath;
};

/**
 * Returns a URL to manage Publicize connections for a given site.
 *
 * @param  {object} site Site object
 * @return {string}      URL to manage Publicize connections
 */
export const publicizeConnections = function( site ) {
	var url = '/sharing';

	if ( site ) {
		url += '/' + site.slug;
	}

	return url;
};

/**
 * Returns a URL to manage Jetpack modules for a given site.
 *
 * @param  {object} site 	Site object
 * @param  {string} module	Optional module name to link to
 * @return {string}      	URL to manage Jetpack modules
 */
export const jetpackModules = function( site, module ) {
	var url = '';
	if ( ! site.jetpack ) {
		return url;
	}

	url = site.options.admin_url + 'admin.php?page=jetpack_modules';
	if ( module ) {
		url += '&info=' + module;
	}

	return url;
};
