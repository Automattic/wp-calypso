export function isFetchingNextPage( state ) {
	return state.themes.themesList.getIn( [ 'queryState', 'isFetchingNextPage' ] );
}

export function isLastPage( state ) {
	return state.themes.themesList.getIn( [ 'queryState', 'isLastPage' ] );
}

export function getThemesList( state ) {
	return state.themes.themesList.get( 'list' );
}

export function getQueryParams( state ) {
	return state.themes.themesList.get( 'query' ).toObject();
}
