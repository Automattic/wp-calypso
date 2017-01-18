/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

const FLUSH_TIMEOUT = 50;

const createQueue = () => {
	let requests = [];

	const flush = () => {
		if ( ! requests.length ) {
			return;
		}
		const requestsToTrigger = requests;
		requests = [];
		const batch = wpcom.batch();
		requestsToTrigger.forEach( request => batch.add( request.url ) );
		batch.run( ( err, responses ) => {
			if ( err ) {
				return requestsToTrigger.forEach( request => request.reject( err ) );
			}
			requestsToTrigger.forEach( request => {
				const response = responses[ request.url ];
				// The Batch API should always return the status_code even for successfull responses
				// That way, we could check the value of the status code to switch between reject/resolve
				if ( response.status_code ) {
					request.reject( response );
				} else {
					request.resolve( response );
				}
			} );
		} );
	};

	const request = url => {
		return new Promise( ( resolve, reject ) =>
			requests.push( { url, resolve, reject } )
		);
	};

	setInterval( flush, FLUSH_TIMEOUT );

	return {
		request
	};
};

export default createQueue();
