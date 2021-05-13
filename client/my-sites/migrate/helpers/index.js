/**
 * External dependencies
 */
import page from 'page';

/**
 * Redirects the page to a target `url`.
 *
 * This is a wrapper over `page.redirect` that also pushes the URL to the history, to make the back button work properly
 *
 * @param url The URL to redirect to
 */
export function redirectTo( url ) {
	if ( window && window.history && window.history.pushState ) {
		/**
		 * Because query parameters aren't processed by `page.show`, we're forced to use `page.redirect`.
		 * Unfortunately, `page.redirect` breaks the back button behavior.
		 * This is a Work-around to push importUrl to history to fix the back button.
		 * See https://github.com/visionmedia/page.js#readme
		 */
		window.history.pushState( null, null, url );
	}

	return page.redirect( url );
}

/**
 * Get the Import Section URL depending on if the site is Jetpack or WordPress.com Simple site.
 *
 * @param siteSlug The Site Slug
 * @param isJetpack If the site is a Jetpack site
 * @returns {string} The URL that points to the import section
 */
export function getImportSectionLocation( siteSlug, isJetpack = false ) {
	return isJetpack
		? `https://${ siteSlug }/wp-admin/import.php`
		: `/import/${ siteSlug }/?engine=wordpress`;
}
