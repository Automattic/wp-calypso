/** @ssr-ready **/

export function getThemeDetails( state, id ) {
	const theme = state.themes.themeDetails.get( id );
	return theme ? theme.toJS() : undefined;
}
