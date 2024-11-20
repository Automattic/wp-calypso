import { getAdminColor } from 'calypso/state/admin-color/selectors';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function getColorScheme( { state, isGlobalSidebarVisible, sectionName } ) {
	if ( isGlobalSidebarVisible ) {
		return 'global';
	}
	if ( sectionName === 'checkout' ) {
		return null;
	}
	const calypsoColorScheme = getPreference( state, 'colorScheme' );
	const siteId = getSelectedSiteId( state );
	const siteColorScheme = getAdminColor( state, siteId );

	return siteColorScheme ?? calypsoColorScheme;
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

		const themeColor = getComputedStyle( document.body )
			.getPropertyValue( '--color-masterbar-background' )
			.trim();
		const themeColorMeta = document.querySelector( 'meta[name="theme-color"]' );
		// We only adjust the `theme-color` meta content value in case we set it in `componentDidMount`
		if ( themeColorMeta && themeColorMeta.getAttribute( 'data-colorscheme' ) === 'true' ) {
			themeColorMeta.content = themeColor;
		}
	}
}
