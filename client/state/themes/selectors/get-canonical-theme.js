import { find } from 'lodash';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { Theme } from 'calypso/types';
import 'calypso/state/themes/init';

/**
 * knownConflictingThemes: A list of themeIds which we prefer to fetch from the
 * jetpack/atomic site over the wpcom/wporg galleries.
 *
 * In most cases, we want to prefer the theme information found on wpcom or
 * wporg over the information found on a user's jetpack or atomic site, because
 * the info on wpcom or wporg has a longer description, more screenshots, and
 * more fields.
 *
 * However, some themes have a conflicting themeId. For example, let's say I
 * buy the bistro theme off woocommerce.com and install it on my jetpack or
 * atomic site. When I search for information about 'bistro' in the WPCOM ->
 * WPORG -> JP/Atomic order, I will first find information in
 * https://wp-themes.com/bistro/, which is a completely different theme than
 * the one offered on woocommerce.
 *
 * One solution would be to always prefer what's found on a user's
 * jetpack/atomic site over the centralized galleries. However, that results in
 * a notably degraded experience when looking at the theme info for popular
 * bundled themes like twentytwentyone.
 *
 * So it seems somewhat hacky, but keeping a list of themes where we prefer the
 * jetpack/atomic versions is a straightforward way to solve the bistro conflict while
 * keeping the rich theme information for twentytwentyone.
 */
export const knownConflictingThemes = new Set( [ 'bistro' ] );

/**
 * Returns a theme object from what is considered the 'canonical' source, i.e.
 * the one with richest information. Checks WP.com (which has a long description
 * and multiple screenshots, and a preview URL) first, then WP.org (which has a
 * preview URL), then the given JP site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Jetpack Site ID to fall back to
 * @param  {string | null}  themeId Theme ID
 * @returns {?Theme}         Theme object
 */
export function getCanonicalTheme( state, siteId, themeId ) {
	let searchOrder = [ 'wpcom', 'wporg', siteId ];
	if ( knownConflictingThemes.has( themeId ) ) {
		searchOrder = [ siteId, 'wpcom', 'wporg' ];
	}

	const source = find( searchOrder, ( s ) => getTheme( state, s, themeId ) );
	return getTheme( state, source, themeId );
}
