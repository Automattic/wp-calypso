/**
 * External dependencies
 */
import LRU from 'lru';

/**
 * Creates a caching action creator
 *
 * @example Here's a caching action creator:
 * export const fetchOAuth2ClientData = cachingActionCreatorFactory(
 *	clientId => wpcom.undocumented().oauth2ClientId( clientId ),
 *	dispatch => clientId => dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST, clientId, } ),
 *	dispatch => wpcomResponse => dispatch( { type: OAUTH2_CLIENT_DATA_REQUEST_SUCCESS, data: wpcomResponse } ),
 *	dispatch => wpcomError => {
 *		const error = {
 *			message: wpcomError.message,
 *			code: wpcomError.error,
 *		};
 *
 *		dispatch( {
 *			type: OAUTH2_CLIENT_DATA_REQUEST_FAILURE,
 *			error,
 *		} );
 *
 *		return Promise.reject( error );
 *	},
 *);
 *
 * @param {Function} worker a worker function that returns the promise ( param1, param2, ... ) => Promise
 * @param {Function} loadingActionCreator an action creator for before the work is performed of the following signature:
 * 					dispatch => ( param1, param2, ... ) => dispatch( ... ),
 * @param {Function} successActionCreator an action creator for the success case of the work performed of the following signature:
 * 					dispatch => ( param1, param2, ... ) => dispatch( ... ),
 * @param {Function} failureActionCreator an action creator for the failure case of the work performed of the following signature:
 * 					dispatch => ( param1, param2, ... ) => dispatch( ... ),
 * @param {Function} parametersHashFunction a hash function for params, default is just array's join
 * @param {Object} cacheOptions options that passed to LRU cache constructor
 *
 * @return {Function} a function that can be used as an action creator of the following signature:
 * 					( param1, param2, ... ) => dispatch => Promise
 */
export const cachingActionCreatorFactory = (
	worker,
	loadingActionCreator,
	successActionCreator,
	failureActionCreator,
	parametersHashFunction = params => params.join( '' ),
	cacheOptions = {
		// those are passed to LRU ctor directly
		max: 100,
		maxAge: 2 * 60 * 60, // 2 hours
	}
) => {
	const cache = new LRU( cacheOptions );

	return ( ...params ) => dispatch => {
		loadingActionCreator( dispatch )( ...params );

		const cacheKey = parametersHashFunction( params );
		const cachedValue = cache.get( cacheKey );
		const resultPromise = cachedValue ? Promise.resolve( cachedValue ) : worker( ...params );

		return resultPromise.then( result => {
			cache.set( cacheKey, result );
			return successActionCreator( dispatch )( result );
		}, failureActionCreator( dispatch ) ); // we don't cache failures
	};
};
