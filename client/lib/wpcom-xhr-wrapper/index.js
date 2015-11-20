import xhr from 'wpcom-xhr-request';

export default function( params, callback ) {
	return xhr( params, function( error, response ) {
		if ( error && error.response && typeof error.response.body ) {
			// Extend the error object in a way to match wpcom-proxy-request
			error.httpMessage = error.message;
			error.message = error.response.body.message;
			error.error = error.response.body.error;
			error.statusCode = error.status;
		}

		callback( error, response );
	} );
}
