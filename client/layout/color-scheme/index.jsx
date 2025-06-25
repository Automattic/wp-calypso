import config from '@automattic/calypso-config';
import { getAdminColor } from 'calypso/state/admin-color/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function getColorScheme( { state, isGlobalSidebarVisible, sidebarIsHidden, sectionName } ) {
	if ( sectionName === 'checkout' ) {
		return null;
	}

	if ( isGlobalSidebarVisible || sidebarIsHidden ) {
		return 'global';
	}

	const siteId = getSelectedSiteId( state );
	const siteColorScheme = getAdminColor( state, siteId );

	return siteColorScheme ?? 'default';
}

export function getColorSchemeFromCurrentQuery( currentQuery, defaultColorScheme = 'default' ) {
	if ( currentQuery?.color_scheme ) {
		return currentQuery.color_scheme;
	}

	if ( currentQuery?.redirect_to ) {
		try {
			return new URLSearchParams( currentQuery.redirect_to ).get( 'color_scheme' );
		} catch ( error ) {
			return defaultColorScheme;
		}
	}

	return defaultColorScheme;
}

export function refreshColorScheme( prevColorScheme, nextColorScheme ) {
	if ( typeof document === 'undefined' ) {
		return;
	}
	if ( prevColorScheme === nextColorScheme ) {
		return;
	}

	const classList = document.querySelector( 'body' ).classList;

	if ( prevColorScheme ) {
		classList.remove( `is-${ prevColorScheme }` );
	}

	if ( nextColorScheme ) {
		classList.add( `is-${ nextColorScheme }` );
	}

	if ( config( 'theme_color_admin_color_scheme_override' ) ) {
		const themeColor = getComputedStyle( document.body )
			.getPropertyValue( '--color-masterbar-background' )
			.trim();
		const themeColorMeta = document.querySelector( 'meta[name="theme-color"]' );
		if ( themeColorMeta && themeColor ) {
			themeColorMeta.content = themeColor;
		}
	}
}
