import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { requestSitePosts } from 'calypso/state/posts/actions';
import { THEME_ACTIVATE_SUCCESS } from 'calypso/state/themes/action-types';
import {
	getActiveTheme,
	getLastThemeQuery,
	getCanonicalTheme,
	prependThemeFilterKeys,
} from 'calypso/state/themes/selectors';
import { getThemeIdFromStylesheet } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

function isClassicTheme( theme ) {
	const themeFeatures = theme?.taxonomies?.theme_feature;
	return themeFeatures && themeFeatures.every( ( feature ) => feature.slug !== 'block-templates' );
}

function isBlockTheme( theme ) {
	const themeFeatures = theme?.taxonomies?.theme_feature;
	return themeFeatures && themeFeatures.some( ( feature ) => feature.slug === 'block-templates' );
}

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
		} );
		dispatch( withAnalytics( trackThemeActivation, action ) );

		// When switching from a block-based theme to a classic theme and vice versa, the admin
		// sidebar toggles site editor and customizer menu item visiblity. The admin bar needs to be
		// refreshed to see the updates.
		const previousTheme = getCanonicalTheme( getState(), siteId, previousThemeId );
		const newTheme = getCanonicalTheme( getState(), siteId, themeId );

		if (
			( isClassicTheme( previousTheme ) && isBlockTheme( newTheme ) ) ||
			( isBlockTheme( previousTheme ) && isClassicTheme( newTheme ) )
		) {
			dispatch( requestAdminMenu( siteId ) );
		}

		// Update pages in case the front page was updated on theme switch.
		dispatch( requestSitePosts( siteId, { type: 'page' } ) );
	};
	return themeActivatedThunk; // it is named function just for testing purposes
}
