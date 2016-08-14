/**
 * External Dependencies
 */
import superagent from 'superagent';

/**
 * Internal Dependencies
 */
import {
	GEOLOCATION_FETCH,
	GEOLOCATION_FETCH_COMPLETED,
	GEOLOCATION_FETCH_FAILED
} from 'state/action-types';

export function fetchGeolocation( dispatch ) {
	return () => {
		dispatch( {
			type: GEOLOCATION_FETCH
		} );

		superagent.get( 'https://public-api.wordpress.com/geo.php' )
			.then( res => {
				dispatch( {
					type: GEOLOCATION_FETCH_COMPLETED,
					location: res.body
				} );
				return res.body;
			} )
			.catch( err => {
				dispatch( {
					type: GEOLOCATION_FETCH_FAILED,
					error: err
				} );
				throw err;
			} );
	};
}
