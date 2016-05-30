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
	// premium theme price.display example: "<abbr title="United States Dollars">$</abbr>65"
	const priceMatcher = /^<[^>]*>([^<]*)<[^>]*>(\d*)$/;
	return price.display.replace( priceMatcher, '$1$2' );
}
