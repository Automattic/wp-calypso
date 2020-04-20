/**
 * External dependencies
 */
import { parse, stringify } from 'qs';

export default function wpcomSupport( wpcom ) {
	let supportUser = '';
	let supportToken = '';
	let interceptResponse = null;

	/**
	 * Add the supportUser and supportToken to the query.
	 *
	 * @param {object}  params The original request params object
	 * @returns {object}        The new query object with support data injected
	 */
	const addSupportData = function ( params ) {
		// Unwind the query string
		const query = parse( params.query );

		// Inject the credentials
		query.support_user = supportUser;
		query._support_token = supportToken;

		return Object.assign( {}, params, {
			query: stringify( query ),
		} );
	};

	/**
	 * Add the supportUser and supportToken to the query.
	 *
	 * @param {object}  params The original request params object
	 * @returns {object}        The new query object with support data injected
	 */
	const addSupportParams = function ( params ) {
		return {
			...params,
			support_user: supportUser,
			_support_token: supportToken,
		};
	};

	const request = wpcom.request.bind( wpcom );

	return Object.assign( wpcom, {
		addSupportParams,
		/**
		 * @param {string} supportUser  Support username
		 * @param {string} supportToken Support token
		 * @returns {bool}  true if the user and token were changed, false otherwise
		 */
		setSupportUserToken: function ( newUser = '', newToken = '', newTokenErrorCallback ) {
			if ( newUser !== supportUser || newToken !== supportToken ) {
				supportUser = newUser;
				supportToken = newToken;
				interceptResponse = ( callback ) => {
					return ( response, ...args ) => {
						if (
							response &&
							response.error &&
							response.error === 'invalid_support_token' &&
							typeof newTokenErrorCallback === 'function'
						) {
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
		},
	} );
}
