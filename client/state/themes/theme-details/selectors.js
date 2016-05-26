/** @ssr-ready **/

export function getThemeDetails( state, id ) {
	let theme = state.themes.themeDetails.get( id );
	theme = theme ? theme.toJS() : {};
	if ( theme.price ) {
		theme.price = formatPrice( theme.price );
	}
	return theme;
}

// Convert price to format used by v1.2 themes API to fit with existing components.
// TODO (seear): remove when v1.2 theme details endpoint is added
function formatPrice( price ) {
	if ( price.value === 0 ) {
		// Free themes have plaintext string
		return price.display;
	}
	// Premium themes have markup in price.display, so create our own plaintext
	return price.value.toLocaleString( 'default', {
		style: 'currency',
		currency: price.currency,
		minimumFractionDigits: 0,
	} );
}
