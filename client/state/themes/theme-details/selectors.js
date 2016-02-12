export function getThemeDetails( state, id ) {
	return state.themes.themeDetails.get( id ).toJS();
}
