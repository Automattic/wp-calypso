import 'calypso/state/themes/init';
import { requestTheme, activate } from 'calypso/state/themes/actions';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

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
 *
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {string}   source    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased Whether the theme has been purchased prior to activation
 * @param  {boolean}  keepCurrentHomepage Prevent theme from switching homepage content if this is what it'd normally do when activated
 * @returns {Function}          Action thunk
 */
export function requestThenActivate(
	themeId,
	siteId,
	source = 'unknown',
	purchased = false,
	keepCurrentHomepage = false
) {
	return ( dispatch, getState ) => {
		// Improvement: Can be conditional and only requestTheme if theme is null
		const state = getState();
		const theme = getTheme( state, 'wpcom', themeId );
		if ( theme ) {
			console.log( 'TODO: requesting was not needed here' );
		}

		console.log( 'dispatching requestTheme...' );
		return dispatch( requestTheme( themeId, siteId ) ).then( () => {
			console.log( 'dispatching activate...' );
			dispatch( activate( themeId, siteId, source, purchased, keepCurrentHomepage ) );
		} );
	};
}
