import { getThemeIdFromStylesheet } from '@automattic/data-stores';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { requestSitePosts } from 'calypso/state/posts/actions';
import { requestSiteSettings } from 'calypso/state/site-settings/actions';
import { THEME_ACTIVATE_SUCCESS } from 'calypso/state/themes/action-types';
import {
	getActiveTheme,
	getLastThemeQuery,
	getThemeType,
	prependThemeFilterKeys,
	getThemeTierForTheme,
} from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

/**
 * Returns an action thunk to be used in signalling that a theme has been activated
 * on a given site. Careful, this action is different from most others here in that
 * expects a theme stylesheet string (not just a theme ID).
 * @param  {string}   themeStylesheet    Theme stylesheet string (*not* just a theme ID!)
 * @param  {number}   siteId             Site ID
 * @param  {string}   source             The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased          Whether the theme has been purchased prior to activation
 * @param  {string}   styleVariationSlug The theme style slug
 * @returns {Function}                   Action thunk
 */
export function themeActivated(
	themeStylesheet,
	siteId,
	source = 'unknown',
	purchased = false,
	styleVariationSlug
) {
	const action = {
		type: THEME_ACTIVATE_SUCCESS,
		themeStylesheet,
		siteId,
	};

	if ( source === 'assembler' ) {
		return action;
	}

	// it is named function just for testing purposes
	return function themeActivatedThunk( dispatch, getState ) {
		const themeId = getThemeIdFromStylesheet( themeStylesheet );
		const previousThemeId = getActiveTheme( getState(), siteId );
		const query = getLastThemeQuery( getState(), siteId );
		const search_taxonomies = prependThemeFilterKeys( getState(), query.filter );
		const search_term = search_taxonomies + ( query.search || '' );
		const trackThemeActivation = recordTracksEvent( 'calypso_themeshowcase_theme_activate', {
			theme: themeId,
			previous_theme: previousThemeId,
			source: source,
			purchased: purchased,
			search_term: search_term || null,
			search_taxonomies,
			style_variation_slug: styleVariationSlug || '',
			theme_type: getThemeType( getState(), themeId ),
			theme_tier: getThemeTierForTheme( getState(), themeId )?.slug,
		} );
		dispatch( withAnalytics( trackThemeActivation, action ) );

		// There are instances where switching themes toggles menu items. This action refreshes
		// the admin bar to ensure that those updates are displayed in the UI.
		dispatch( requestAdminMenu( siteId ) );

		// In case the front page options were updated on theme switch,
		// request the latest settings and pages to reflect them.
		dispatch( requestSiteSettings( siteId ) );
		dispatch( requestSitePosts( siteId, { type: 'page' } ) );
	};
}
