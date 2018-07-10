const namespaceAndEndpointMiddleware = ( options, next ) => {
	let path = options.path;
	let namespaceTrimmed, endpointTrimmed;

	if (
		typeof options.namespace === 'string' &&
			typeof options.endpoint === 'string'
	) {
		namespaceTrimmed = options.namespace.replace( /^\/|\/$/g, '' );
		endpointTrimmed = options.endpoint.replace( /^\//, '' );
		if ( endpointTrimmed ) {
			path = namespaceTrimmed + '/' + endpointTrimmed;
		} else {
			path = namespaceTrimmed;
		}
	}

	delete options.namespace;
	delete options.endpoint;

	return next( {
		...options,
		path,
	} );
};

export default namespaceAndEndpointMiddleware;
