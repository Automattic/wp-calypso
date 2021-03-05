const SITE_FRAGMENT_REGEX = /\/(:site|:site_id|:siteid|:blogid|:blog_id|:siteslug)(\/|$|\?)/i;

/**
 * Check if a path should report the currently selected site ID.
 *
 * Some paths should never report it because it's used
 * to tell general admin and site-specific activities apart.
 *
 * @param {string} path The tracked path.
 * @returns {boolean} If the report should null `blog_id`.
 */
export default ( path ) => {
	if ( ! path ) {
		return true;
	}
	return ! SITE_FRAGMENT_REGEX.test( path );
};
