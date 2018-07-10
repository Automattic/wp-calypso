function httpV1Middleware( options, next ) {
	const newOptions = { ...options };
	if ( newOptions.method ) {
		if ( [ 'PATCH', 'PUT', 'DELETE' ].indexOf( newOptions.method.toUpperCase() ) >= 0 ) {
			if ( ! newOptions.headers ) {
				newOptions.headers = {};
			}
			newOptions.headers[ 'X-HTTP-Method-Override' ] = newOptions.method;
			newOptions.method = 'POST';

			newOptions.contentType = 'application/json';
			newOptions.data = JSON.stringify( newOptions.data );
		}
	}

	return next( newOptions, next );
}

export default httpV1Middleware;
