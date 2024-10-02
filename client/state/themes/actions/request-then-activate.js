import 'calypso/state/themes/init';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { requestTheme, activate } from 'calypso/state/themes/actions';

/**
 * requestThenActivate: Like activate(), which triggers a network request to
 * activate a specific theme on a given site, but it calls requestTheme() to
 * get that theme's information first.
 *
 * This allows Calypso to know if the theme is an autoloading homepage theme,
 * which changes the activation behavior (these themes display a modal to the
 * user before activating).
 * Generally it's not needed if you're already on the theme showcase, but if you're
 * somewhere else on the site, the data might not be available.
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {string}   source    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased Whether the theme has been purchased prior to activation
 * @returns {Function}          Action thunk
 */

export function requestThenActivate( themeId, siteId, source = 'unknown', purchased = false ) {
	return ( dispatch, getState ) => {
		// Request the theme, then when that's done, activate it.

		// We don't know where the theme is: It could be in the wpcom gallery,
		// the wporg gallery, or directly on the jetpack site.
		// Request the theme in all 2-3 locations, then activate after.

		// This does seem messy. An alternative approach would be to use the
		// isWpcomTheme() and isWporgTheme() selectors, however, those don't
		// work unless we already have the full list of themes from each
		// gallery. Since this action is designed to be used in places that
		// might not have already loaded theme information (like the checkout
		// thank you page), that means we'd have to requestThemes() on both
		// galleries to load the entire list before using those selectors.
		// Ultimately, it's less work to ask for the theme in 2-3 locations
		// directly instead of loading the entire galleries of wpcom and wporg
		// to know where to ask.
		const requests = [
			dispatch( requestTheme( themeId, 'wpcom' ) ),
			dispatch( requestTheme( themeId, 'wporg' ) ),
		];
		if ( isJetpackSite( getState(), siteId ) ) {
			requests.push( dispatch( requestTheme( themeId, siteId ) ) );
		}
		return Promise.all( requests ).then( () => {
			dispatch( activate( themeId, siteId, { source, purchased } ) );
		} );
	};
}
