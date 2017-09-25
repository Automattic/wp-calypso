/**
 * External dependencies
 */
import qs from 'qs';

export default function wpcomSupport( wpcom ) {
	let supportUser = '';
	let supportToken = '';
	let interceptResponse = null;

	/**
	 * Add the supportUser and supportToken to the query.
	 * @param {Object}  params The original request params object
	 * @return {Object}        The new query object with support data injected
	 */
	const addSupportData = function( params ) {
		// Unwind the query string
		const query = qs.parse( params.query );

		// Inject the credentials
		query.support_user = supportUser;
		query._support_token = supportToken;

		return Object.assign( {}, params, {
			query: qs.stringify( query )
		} );
	};

	const request = wpcom.request.bind( wpcom );

	return Object.assign( wpcom, {
		fetchSupportUserToken: function( username, password ) {
			return wpcom.req.post(
				{
					apiVersion: '1.1',
					path: `/internal/support/${ username }/grant`
				},
				{
					password: password
				}
			);
		},
		/**
		 * @param {String} supportUser  Support username
		 * @param {String} supportToken Support token
		 * @returns {bool}  true if the user and token were changed, false otherwise
		 */
		setSupportUserToken: function( newUser = '', newToken = '', newTokenErrorCallback ) {
			if ( newUser !== supportUser || newToken !== supportToken ) {
				supportUser = newUser;
				supportToken = newToken;
				interceptResponse = ( callback ) => {
					return ( response, ...args ) => {
						if ( response && response.error &&
							response.error === 'invalid_support_token' &&
							typeof newTokenErrorCallback === 'function' ) {
							newTokenErrorCallback( response );
						} else {
							// Call the original response callback
							callback( response, ...args );
						}
					};
				};
				return true;
			}
			return false;
		},
		request: ( params, callback ) => {
			if ( supportUser && supportToken && interceptResponse ) {
				return request( addSupportData( params ), interceptResponse( callback ) );
			}

			return request( params, callback );
		}
	} );
}
