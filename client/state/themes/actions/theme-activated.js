/**
 * Internal dependencies
 */
import { THEME_ACTIVATE_SUCCESS } from 'state/action-types';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { requestSitePosts } from 'state/posts/actions';
import { getActiveTheme, getLastThemeQuery, prependThemeFilterKeys } from 'state/themes/selectors';
import { getThemeIdFromStylesheet } from 'state/themes/utils';

import 'state/themes/init';

/**
 * Returns an action thunk to be used in signalling that a theme has been activated
 * on a given site. Careful, this action is different from most others here in that
 * expects a theme stylesheet string (not just a theme ID).
 *
 * @param  {string}   themeStylesheet Theme stylesheet string (*not* just a theme ID!)
 * @param  {number}   siteId          Site ID
 * @param  {string}   source          The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased       Whether the theme has been purchased prior to activation
 * @returns {Function}                 Action thunk
 */
export function themeActivated( themeStylesheet, siteId, source = 'unknown', purchased = false ) {
	const themeActivatedThunk = ( dispatch, getState ) => {
		const action = {
			type: THEME_ACTIVATE_SUCCESS,
			themeStylesheet,
			siteId,
		};
		const previousThemeId = getActiveTheme( getState(), siteId );
		const query = getLastThemeQuery( getState(), siteId );
		const search_taxonomies = prependThemeFilterKeys( getState(), query.filter );
		const search_term = search_taxonomies + ( query.search || '' );
		const trackThemeActivation = recordTracksEvent( 'calypso_themeshowcase_theme_activate', {
			theme: getThemeIdFromStylesheet( themeStylesheet ),
			previous_theme: previousThemeId,
			source: source,
			purchased: purchased,
			search_term: search_term || null,
			search_taxonomies,
		} );
		dispatch( withAnalytics( trackThemeActivation, action ) );

		// Update pages in case the front page was updated on theme switch.
		dispatch( requestSitePosts( siteId, { type: 'page' } ) );
	};
	return themeActivatedThunk; // it is named function just for testing purposes
}
