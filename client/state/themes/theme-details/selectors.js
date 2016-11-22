

export function getThemeDetails( state, id ) {
	let theme = state.themes.themeDetails.get( id );
	theme = theme ? theme.toJS() : {};
	return theme;
}

export function isRequestingThemeDetails( state, id ) {
	return !! getThemeDetails( state, id ).isRequesting;
}
