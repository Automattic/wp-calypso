/** @ssr-ready **/

export function isJetpack( state ) {
	return !! state.themes.themesLastQuery.get( 'isJetpack' );
}

export function getParams( state ) {
	return state.themes.themesLastQuery.get( 'lastParams' ) || {};
}

export function getQuerySiteId( state ) {
	return state.themes.themesLastQuery.get( 'currentSiteId' );
}

export function hasParams( state ) {
	return !! state.themes.themesLastQuery.get( 'lastParams' );
}
