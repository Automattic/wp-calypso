import { find } from 'lodash';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { Theme } from 'calypso/types';
import 'calypso/state/themes/init';

/**
 * wpcomsh rewrites `theme_uri` to this prefix only for symlinked WP.com
 * themes (`wpcomsh_add_wpcom_suffix_to_theme_endpoint_response` filter).
 * It is the signal that distinguishes a managed WP.com copy of a slug from
 * a manually uploaded third-party theme that happens to share the slug.
 */
const SYMLINKED_THEME_URI_PREFIX = 'https://wordpress.com/theme/';
const SITE_THEME_OVERRIDE_FIELDS = [ 'name', 'author', 'author_uri', 'theme_uri', 'version' ];
const URL_OVERRIDE_FIELDS = new Set( [ 'author_uri', 'theme_uri' ] );

function isSafeHttpUrl( url ) {
	if ( typeof url !== 'string' ) {
		return false;
	}

	try {
		const parsedUrl = new URL( url );
		return [ 'http:', 'https:' ].includes( parsedUrl.protocol );
	} catch {
		return false;
	}
}

/**
 * Whether the site's theme record represents the symlinked WP.com-managed
 * copy of a slug, as opposed to a manually uploaded third-party theme.
 * @param  {Object} siteTheme Theme record from the site's `queries[siteId]` subtree.
 * @returns {boolean}
 */
function isSymlinkedManagedTheme( siteTheme ) {
	const themeUri = siteTheme?.theme_uri;
	return (
		typeof themeUri === 'string' &&
		themeUri.startsWith( SYMLINKED_THEME_URI_PREFIX ) &&
		themeUri.length > SYMLINKED_THEME_URI_PREFIX.length
	);
}

function getSafeSiteOverride( field, siteTheme, wpcomTheme ) {
	const siteValue = siteTheme[ field ];
	if ( siteValue == null ) {
		return wpcomTheme[ field ];
	}

	if ( URL_OVERRIDE_FIELDS.has( field ) && ! isSafeHttpUrl( siteValue ) ) {
		return wpcomTheme[ field ];
	}

	return siteValue;
}

function mergeCollisionTheme( wpcomTheme, siteTheme ) {
	return {
		...wpcomTheme,
		...Object.fromEntries(
			SITE_THEME_OVERRIDE_FIELDS.map( ( field ) => [
				field,
				getSafeSiteOverride( field, siteTheme, wpcomTheme ),
			] )
		),
		retired: false,
	};
}

/**
 * Resolves the slug-collision case where the WP.com catalog has a record
 * AND the site has a same-slug unmanaged record. Returns a merged theme
 * object (site display fields override wpcom, wpcom-shape fields preserved
 * for downstream consumers, `retired` cleared), or `null` when the
 * condition does not apply. Symlinked managed copies return `null` so
 * legitimately-installed WP.com themes keep their canonical record (and
 * the retired notice when applicable).
 * @param  {Object} state   Global state tree
 * @param  {number} siteId  Site ID
 * @param  {string} themeId Theme ID
 * @returns {?Object}        Merged theme object, or `null`.
 */
function getCollisionTheme( state, siteId, themeId ) {
	const wpcomTheme = getTheme( state, 'wpcom', themeId );
	const siteTheme = siteId ? getTheme( state, siteId, themeId ) : null;
	if ( ! wpcomTheme || ! siteTheme || isSymlinkedManagedTheme( siteTheme ) ) {
		return null;
	}
	return mergeCollisionTheme( wpcomTheme, siteTheme );
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
	const collisionMerge = getCollisionTheme( state, siteId, themeId );
	if ( collisionMerge ) {
		return collisionMerge;
	}

	const searchOrder = [ 'wpcom', 'wporg', siteId ];
	const source = find( searchOrder, ( s ) => getTheme( state, s, themeId ) );
	return getTheme( state, source, themeId );
}
