import { find } from 'lodash';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { Theme } from 'calypso/types';
import 'calypso/state/themes/init';

/**
 * Slugs whose installed copy on a site typically differs from the WP.com
 * catalog entry with the same slug. Lookup order inverts to site-first for
 * these so we don't show the wrong theme's metadata. Maintain manually.
 */
export const knownConflictingThemes = new Set( [ 'bistro' ] );

/**
 * wpcomsh rewrites `theme_uri` to this prefix only for symlinked WP.com
 * themes (`wpcomsh_add_wpcom_suffix_to_theme_endpoint_response` filter).
 * It is the signal that distinguishes a managed WP.com copy of a slug from
 * a manually uploaded third-party theme that happens to share the slug.
 */
const SYMLINKED_THEME_URI_PREFIX = 'https://wordpress.com/theme/';

/**
 * Whether the site's theme record represents the symlinked WP.com-managed
 * copy of a slug, as opposed to a manually uploaded third-party theme.
 * @param  {Object} siteTheme Theme record from the site's `queries[siteId]` subtree.
 * @returns {boolean}
 */
function isSymlinkedManagedTheme( siteTheme ) {
	return Boolean( siteTheme?.theme_uri?.startsWith( SYMLINKED_THEME_URI_PREFIX ) );
}

/**
 * Resolves the slug-collision case where the WP.com catalog has a retired
 * record AND the site has a same-slug unmanaged record. Returns a merged
 * theme object (site display fields override wpcom, wpcom-shape fields
 * preserved for downstream consumers, `retired` cleared), or `null` when
 * the condition does not apply. Symlinked managed copies return `null` so
 * legitimately-retired premium themes keep their canonical record.
 * @param  {Object} state   Global state tree
 * @param  {number} siteId  Site ID
 * @param  {string} themeId Theme ID
 * @returns {?Object}        Merged theme object, or `null`.
 */
function getRetiredCollisionTheme( state, siteId, themeId ) {
	const wpcomTheme = getTheme( state, 'wpcom', themeId );
	const siteTheme = siteId ? getTheme( state, siteId, themeId ) : null;
	if ( ! wpcomTheme?.retired || ! siteTheme || isSymlinkedManagedTheme( siteTheme ) ) {
		return null;
	}
	return {
		...wpcomTheme,
		...siteTheme,
		retired: false,
	};
}

/**
 * Returns a theme object from what is considered the 'canonical' source, i.e.
 * the one with richest information. Checks WP.com (which has a long description
 * and multiple screenshots, and a preview URL) first, then WP.org (which has a
 * preview URL), then the given JP site.
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Jetpack Site ID to fall back to
 * @param  {string|null|undefined}  themeId Theme ID
 * @returns {?Theme}         Theme object
 */
export function getCanonicalTheme( state, siteId, themeId ) {
	let searchOrder = [ 'wpcom', 'wporg', siteId ];
	if ( knownConflictingThemes.has( themeId ) ) {
		searchOrder = [ siteId, 'wpcom', 'wporg' ];
	}

	const collisionMerge = getRetiredCollisionTheme( state, siteId, themeId );
	if ( collisionMerge ) {
		return collisionMerge;
	}

	const source = find( searchOrder, ( s ) => getTheme( state, s, themeId ) );
	return getTheme( state, source, themeId );
}
