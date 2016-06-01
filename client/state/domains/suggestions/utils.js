/**
 * Returns a serialized domains suggestions query, used as the key in the
 * `state.domains.suggestions` state object.
 *
 * @param  {Object} queryObject   DomainsSuggestions query
 * @return {?String}              Serialized DomainsSuggestions query
 */
export function getSerializedDomainsSuggestionsQuery( queryObject ) {
	if ( ! queryObject ) {
		return null;
	}
	const { query, quantity, vendor } = queryObject;
	if ( ( ! query || query.length === 0 ) || ( ! quantity || quantity <= 0 ) || ( ! vendor || vendor.length === 0 ) ) {
		return null;
	}
	const include_wordpressdotcom = !! ( queryObject.include_wordpressdotcom || queryObject.includeSubdomain );
	return JSON.stringify( {
		query,
		quantity,
		vendor,
		include_wordpressdotcom
	} ).toLocaleLowerCase();
}
