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
