import { parse, stringify } from 'qs';

export default function wpcomSupport( wpcom ) {
	let supportUser = '';
	let supportToken = '';
	let tokenErrorCallback = null;

	/**
	 * Add the supportUser and supportToken to the query.
	 *
	 * @param {Object}  params The original request params object
	 * @returns {Object}        The new query object with support data injected
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
	 * @param {Object}  params The original request params object
	 * @returns {Object}        The new query object with support data injected
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
		 * @param {string} newUser  Support username
		 * @param {string} newToken Support token
		 * @param {Function} newTokenErrorCallback Called when invalid support auth token is detected
		 * @returns {boolean}  true if the user and token were changed, false otherwise
		 */
		setSupportUserToken: function ( newUser = '', newToken = '', newTokenErrorCallback ) {
			if ( newUser === supportUser && newToken === supportToken ) {
				return false;
			}

			supportUser = newUser;
			supportToken = newToken;
			tokenErrorCallback = newTokenErrorCallback;
			return true;
		},
		request: ( params, callback ) => {
			if ( ! ( supportUser && supportToken ) ) {
				return request( params, callback );
			}

			return request( addSupportData( params ), ( error, response ) => {
				if ( tokenErrorCallback && error?.error === 'invalid_support_token' ) {
					tokenErrorCallback( error );
					return;
				}

				// Call the original response callback
				callback( error, response );
			} );
		},
	} );
}
