export default function wpcomSupport( wpcom ) {
	let supportUser = '';
	let supportToken = '';

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
		fnIndex = args.findIndex( function( e ) {
			return 'function' === typeof e;
		} );

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
		return args;
	}

	const del = wpcom.req.del.bind( wpcom.req );
	const get = wpcom.req.get.bind( wpcom.req );
	const post = wpcom.req.post.bind( wpcom.req );
	const put = wpcom.req.put.bind( wpcom.req );

	return Object.assign( wpcom, {
		changeUser: function( username, password, fn ) {
			var args = {
				apiVersion: '1.1',
				path: '/internal/support/' + username + '/grant'
			};

			return wpcom.req.post( args, { password: password }, function( error, response ) {
				if ( ! error ) {
					supportUser = response.username;
					supportToken = response.token;
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
