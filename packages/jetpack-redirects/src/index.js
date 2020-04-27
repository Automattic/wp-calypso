/**
 * Builds an URL using the jetpack.com/redirect service
 *
 * @param {string}  source The URL handler registered in the server
 * @param {object}  args {
 *
 * 		Additional arguments to build the url
 *
 * 		@type {string} site URL of the current site.
 * 		@type {string} path Additional path to be appended to the URL
 * 		@type {string} query Query parameters to be added to the URL
 * 		@type {string} anchor Anchor to be added to the URL
 * }
 *
 * @return {string} The redirect URL
 */
export default function getRedirectUrl( source, args = {} ) {
	const queryVars = {};

	if ( source.search( 'https://' ) === 0 ) {
		const parsedUrl = new URL( source );

		// discard any query and fragments.
		source = `https://${ parsedUrl.host }${ parsedUrl.pathname }`;
		queryVars.url = encodeURIComponent( source );
	} else {
		queryVars.source = encodeURIComponent( source );
	}

	const acceptedArgs = [ 'site', 'path', 'query', 'anchor' ];

	Object.keys( args ).map( ( argName ) => {
		if ( acceptedArgs.includes( argName ) ) {
			queryVars[ argName ] = encodeURIComponent( args[ argName ] );
		}
	} );

	const queryString = Object.keys( queryVars )
		.map( ( key ) => key + '=' + queryVars[ key ] )
		.join( '&' );

	return `https://jetpack.com/redirect/?` + queryString;
}
