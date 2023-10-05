const SITE_FRAGMENT_REGEX = /\/(email|mailboxes|checkout|domains|purchases|plans|view)(\/)*/i;

/**
 * Check if a path should report the current selected site's main product (`site`, `domain` or `email`)
 *
 * Some paths should not report it because it's used for creating funnels to study
 * only email and purchase activities.
 * @param {string} path The tracked path.
 * @returns {boolean} If the report should null `site_main_product`.
 */
export default ( path ) => {
	if ( ! path ) {
		return true;
	}
	return ! SITE_FRAGMENT_REGEX.test( path );
};
