/** @ssr-ready **/

export function getCurrentTheme( state, siteId ) {
	return state.themes.currentTheme.get( 'currentThemes' ).get( siteId );
}

export function isActivating( state ) {
	return state.themes.currentTheme.get( 'isActivating' );
}

export function hasActivated( state ) {
	return state.themes.currentTheme.get( 'hasActivated' );
}

export function isRequestingCurrentTheme( state, siteId ) {
	return !! state.themes.currentTheme.get( 'requesting' ).get( siteId );
}
