/** @ssr-ready **/

export function getThemeDetails( state, id ) {
	let theme = state.themes.themeDetails.get( id );
	theme = theme ? theme.toJS() : {};
	return theme;
}
