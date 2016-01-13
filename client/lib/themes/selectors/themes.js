export function getThemes( state ) {
	return state.themes.themes.get( 'themes' ).toJS();
}

export function getThemeById( state, id ) {
	const theme = state.themes.themes.getIn( [ 'themes', id ] );
	return theme ? theme.toJS() : undefined;
}
