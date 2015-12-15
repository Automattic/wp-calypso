export default function wpcomSupport( wpcom ) {
	let supportUser = '';
	let supportToken = '';
	let tokenErrorCallback;

	// Error names returned by the server
	const ERROR_INVALID_SUPPORT_TOKEN = 'invalid_support_token';
	const ERROR_INCORRECT_SUPPORT_PASSWORD = 'incorrect_password'

	/**
	 * Return the index of the callback in the request arguments
	 */
	const getCallbackIndex = function( args ) {
		return args.findIndex( ( arg ) => {
			return 'function' === typeof arg;
		} );
	}

	/**
	 * Request parameters are as follows:
	 * - param (required) A string or object that contains the path
	 * - query (optional) An object that expands the response object
	 * - body (required*) Required by POST and PUT, but not by GET and DEL
	 * - fn (required) A callback function to handle the returned result
	 * - ...rest (optional) Some queries have additional parameters after
	 *   callback function
	 *
	 * Return the index of the query parameter, or if one does not exist,
	 * return false.
	 */
	const getQueryIndex = function( req, args ) {
		let fnIndex, queryIndex;

		// Find the index of the callback in the arguments
		fnIndex = getCallbackIndex( args );

		// Set queryIndex based on the request type and fnIndex
		if ( req === 'post' || req === 'put' ) {
			queryIndex = ( 3 === fnIndex ) ? 1 : false;
		} else {
			queryIndex = ( 2 === fnIndex ) ? 1 : false;
		}
		return queryIndex;
	}

	/**
	 * Add the supportUser and supportToken to the query.
	 */
	const addSupportData = function( query ) {
		return Object.assign( {}, query, {
			support_user: supportUser,
			_support_token: supportToken
		} );
	}

	/**
	 * Intercept any token errors in the response callback.
	 */
	const interceptResponse = function ( responseCallback ) {
		return ( ...args ) => {
			const error = args[ 0 ],
				response = args[ 1 ];

			if ( error && error.error === ERROR_INVALID_SUPPORT_TOKEN ) {
				if ( tokenErrorCallback ) {
					tokenErrorCallback( error );
				}
			}

			if ( responseCallback ) {
				responseCallback( ...args );
			}
		}
	}

	/**
	 * Mutate the query parameter of the request by adding values for
	 * support_user and _support_token to the query parameter.
	 */
	const extendRequest = function( req, args ) {
		if ( ! supportUser || ! supportToken ) {
			return args;
		}

		let queryIndex = getQueryIndex( req, args );
		if ( queryIndex ) {
			args[ queryIndex ] = addSupportData( args[ queryIndex ] );
		} else {
			args.splice( 1, 0, addSupportData( {} ) );
		}

		let callbackIndex = getCallbackIndex( args );
		if ( callbackIndex ) {
			// Wrap the callback to intercept any token errors
			args[ callbackIndex ] = interceptResponse( args[ callbackIndex ] );
		} else {
			// No response callback was provided, so we add one to the end of the
			// arguments, purely to handle the token errors
			args.push( interceptResponse( null ) );
		}

		return args;
	}

	const del = wpcom.req.del.bind( wpcom.req );
	const get = wpcom.req.get.bind( wpcom.req );
	const post = wpcom.req.post.bind( wpcom.req );
	const put = wpcom.req.put.bind( wpcom.req );

	return Object.assign( wpcom, {
		changeUser: function( username, password, fn, fnTokenError ) {
			var args = {
				apiVersion: '1.1',
				path: '/internal/support/' + username + '/grant'
			};

			tokenErrorCallback = ( ...args ) => {
				wpcom.restoreUser();

				fnTokenError( ...args );
			}

			return wpcom.req.post( args, { password: password }, function( error, response ) {
				if ( ! error ) {
					supportUser = response.username;
					supportToken = response.token;
				}

				if ( error && error.error === ERROR_INCORRECT_SUPPORT_PASSWORD ) {
					fnTokenError( error );
				}

				fn( error, response );
			} );
		},
		restoreUser: function() {
			supportUser = '';
			supportToken = '';
		},
		req: {
			del: function( ...args ) {
				return del( ...extendRequest( 'del', args ) );
			},
			get: function( ...args ) {
				return get( ...extendRequest( 'get', args ) );
			},
			post: function( ...args ) {
				return post( ...extendRequest( 'post', args ) );
			},
			put: function( ...args ) {
				return put( ...extendRequest( 'put', args ) );
			}
		}
	} );
};
