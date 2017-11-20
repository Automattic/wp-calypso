/** @format */

/**
 * External dependencies
 */
import deterministicStringify from 'json-stable-stringify';
import schemaValidator from 'is-my-json-valid';
import { get, identity, merge, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { keyedReducer } from 'state/utils';
import warn from 'lib/warn';

/**
 * Returns response data from an HTTP request success action if available
 *
 * @param {Object} action may contain HTTP response data
 * @returns {?*} response data if available
 */
export const getData = action => get( action, 'meta.dataLayer.data', undefined );

/**
 * Returns error data from an HTTP request failure action if available
 *
 * @param {Object} action may contain HTTP response error data
 * @returns {?*} error data if available
 */
export const getError = action => get( action, 'meta.dataLayer.error', undefined );

/**
 * Returns (response) headers data from an HTTP request action if available
 *
 * @param {Object} action may contain HTTP response headers data
 * @returns {?*} headers data if available
 */
export const getHeaders = action => get( action, 'meta.dataLayer.headers', undefined );

/**
 * @typedef {Object} ProgressData
 * @property {number} loaded number of bytes already transferred
 * @property {number} total total number of bytes to transfer
 */

/**
 * Returns progress data from an HTTP request progress action if available
 *
 * @param {Object} action may contain HTTP progress data
 * @returns {Object|null} progress data if available
 * @returns {ProgressData}
 */
export const getProgress = action => get( action, 'meta.dataLayer.progress', undefined );

export class SchemaError extends Error {
	constructor( errors ) {
		super( 'Failed to validate with JSON schema' );
		this.schemaErrors = errors;
	}
}

export class TransformerError extends Error {
	constructor( error, data, transformer ) {
		super( error.message );
		this.inputData = data;
		this.transformer = transformer;
	}
}

export const makeParser = ( schema, schemaOptions = {}, transformer = identity ) => {
	const options = Object.assign( { verbose: true }, schemaOptions );
	const validator = schemaValidator( schema, options );

	// filter out unwanted properties even though we may have let them slip past validation
	// note: this property does not nest deeply into the data structure, that is, properties
	// of a property that aren't in the schema could still come through since only the top
	// level of properties are pruned
	const filter = schemaValidator.filter( { ...schema, additionalProperties: false } );

	const validate = data => {
		if ( ! validator( data ) ) {
			throw new SchemaError( validator.errors );
		}

		return filter( data );
	};

	const transform = data => {
		try {
			return transformer( data );
		} catch ( e ) {
			throw new TransformerError( e, data, transformer );
		}
	};

	// the actual parser
	return data => transform( validate( data ) );
};
const getRequestStatus = action => {
	if ( undefined !== getError( action ) ) {
		return 'failure';
	}

	if ( undefined !== getData( action ) ) {
		return 'success';
	}

	return 'pending';
};

export const getRequestKey = fullAction => {
	const { meta, ...action } = fullAction; // eslint-disable-line no-unused-vars
	const requestKey = get( meta, 'dataLayer.requestKey' );

	return requestKey ? requestKey : deterministicStringify( action );
};

export const getRequest = ( state, key ) => state.dataRequests[ key ] || {};

export const requestsReducerItem = (
	state = null,
	{ meta: { dataLayer: { lastUpdated, pendingSince, status } = {} } = {} }
) => Object.assign( { status }, lastUpdated && { lastUpdated }, pendingSince && { pendingSince } );

export const reducer = keyedReducer( 'meta.dataLayer.requestKey', requestsReducerItem );

export const isRequestLoading = ( state, action ) =>
	getRequest( state, getRequestKey( action ) ).status === 'pending';

export const hasRequestLoaded = ( state, action ) =>
	getRequest( state, getRequestKey( action ) ).lastUpdated > -Infinity;

/**
 * Tracks the state of network activity for a given request type
 *
 * When we issue _REQUEST type actions they usually create some
 * associated network activity by means of an HTTP request.
 * We may want to know what the status of those requests are, if
 * they have completed or if they have failed.
 *
 * This tracker stores the meta data for those requests which
 * can then be independently polled by React components which
 * need to know about those data requests.
 *
 * Note that this is meta data about remote data requests and
 * _not_ about network activity, which is why this is code is
 * here operating on the _REQUEST actions and not in the HTTP
 * pipeline as a processor on HTTP_REQUEST actions.
 *
 * @param {Function} next next link in HTTP middleware chain
 * @returns {Function} middleware function to track requests
 */
export const trackRequests = next => ( store, action ) => {
	// progress events don't affect
	// any tracking meta at the moment
	if ( true !== get( action, 'meta.dataLayer.trackRequest' ) || getProgress( action ) ) {
		return next( store, action );
	}

	const requestKey = getRequestKey( action );
	const status = getRequestStatus( action );
	const dataLayer = Object.assign(
		{ requestKey, status },
		status === 'pending' ? { pendingSince: Date.now() } : { lastUpdated: Date.now() }
	);

	const dispatch = response => store.dispatch( merge( response, { meta: { dataLayer } } ) );

	next( { ...store, dispatch }, action );
};

/**
 * @type Object default dispatchRequest options
 * @property {Function} fromApi validates and transforms API response data
 * @property {Function} middleware chain of functions to process before dispatch
 * @property {Function} onProgress called on progress events
 */
const defaultOptions = {
	fromApi: identity,
	onProgress: noop,
};

/**
 * Dispatches to appropriate function based on HTTP request meta
 *
 * @see state/data-layer/wpcom-http/actions#fetch creates HTTP requests
 *
 * When the WPCOM HTTP data layer handles requests it will add
 * response data and errors to a meta property on the given success
 * error, and progress handling actions.
 *
 * This function accepts three functions as the initiator, success,
 * and error handlers for actions and it will call the appropriate
 * one based on the stored meta. It accepts an optional fourth
 * function which will be called for progress events on upload.
 *
 * If both error and response data is available this will call the
 * error handler in preference over the success handler, but the
 * response data will also still be available through the action meta.
 *
 * The functions should conform to the following type signatures:
 *   initiator  :: ReduxStore -> Action -> Dispatcher (middleware signature)
 *   onSuccess  :: ReduxStore -> Action -> Dispatcher -> ResponseData
 *   onError    :: ReduxStore -> Action -> Dispatcher -> ErrorData
 *   onProgress :: ReduxStore -> Action -> Dispatcher -> ProgressData
 *   fromApi    :: ResponseData -> [ Boolean, Data ]
 *
 * @param {Function} middleware intercepts requests moving through the system
 * @param {Function} initiator called if action lacks response meta; should create HTTP request
 * @param {Function} onSuccess called if the action meta includes response data
 * @param {Function} onError called if the action meta includes error data
 * @param {Object} options configures additional dispatching behaviors
 + @param {Function} [options.fromApi] maps between API data and Calypso data
 + @param {Function} [options.onProgress] called on progress events when uploading
 * @param {Function} [options.middleware] runs before the dispatch itself
 * @param {Function} [options.onProgress] called on progress events when uploading
 * @returns {?*} please ignore return values, they are undefined
 */
export const requestDispatcher = middleware => ( initiator, onSuccess, onError, options = {} ) => {
	const { fromApi, onProgress } = { ...defaultOptions, ...options };

	return middleware( ( store, action ) => {
		const error = getError( action );
		if ( undefined !== error ) {
			return onError( store, action, error );
		}

		const data = getData( action );
		if ( undefined !== data ) {
			try {
				return onSuccess( store, action, fromApi( data ) );
			} catch ( err ) {
				return onError( store, action, err );
			}
		}

		const progress = getProgress( action );
		if ( undefined !== progress ) {
			return onProgress( store, action, progress );
		}

		return initiator( store, action );
	} );
};

export const dispatchRequest = requestDispatcher( trackRequests );

/**
 * Dispatches to appropriate function based on HTTP request meta
 *
 * @see state/data-layer/wpcom-http/actions#fetch creates HTTP requests
 *
 * When the WPCOM HTTP data layer handles requests it will add
 * response data and errors to a meta property on the given success
 * error, and progress handling actions.
 *
 * This function accepts several functions as the fetch, success, error and
 * progress handlers for actions and it will call the appropriate
 * one based on the stored meta.
 *
 * These handlers are action creators: based on the input data coming from the HTTP request,
 * it will return an action (or an action thunk) to be executed as a response to the given
 * HTTP event.
 *
 * If both error and response data is available this will call the
 * error handler in preference over the success handler, but the
 * response data will also still be available through the action meta.
 *
 * The functions should conform to the following type signatures:
 *   fetch  :: Action -> Action (action creator with one Action parameter)
 *   onSuccess  :: Action -> ResponseData -> Action (action creator with two params)
 *   onError    :: Action -> ErrorData -> Action
 *   onProgress :: Action -> ProgressData -> Action
 *   fromApi    :: ResponseData -> TransformedData throws TransformerError|SchemaError
 *
 * @param {Function} middleware intercepts requests moving through the system
 * @param {Object} options object with named parameters:
 * @param {Function} options.fetch called if action lacks response meta; should create HTTP request
 * @param {Function} options.onSuccess called if the action meta includes response data
 * @param {Function} options.onError called if the action meta includes error data
 * @param {Function} options.onProgress called on progress events when uploading
 * @param {Function} options.fromApi maps between API data and Calypso data
 * @returns {Action} action or action thunk to be executed in response to HTTP event
 */
export const exRequestDispatcher = middleware => options => {
	if ( ! options.fetch ) {
		warn( 'fetch handler is not defined: no request will ever be issued' );
	}

	if ( ! options.onSuccess ) {
		warn( 'onSuccess handler is not defined: response to the request is being ignored' );
	}

	if ( ! options.onError ) {
		warn( 'onError handler is not defined: error during the request is being ignored' );
	}

	return middleware( ( store, action ) => {
		// create the low-level action we want to dispatch
		const requestAction = createRequestAction( options, action );

		// dispatch the low level action (if any was created) and return the result
		if ( ! requestAction ) {
			return;
		}

		if ( Array.isArray( requestAction ) ) {
			return requestAction.map( store.dispatch );
		}

		return store.dispatch( requestAction );
	} );
};
export const dispatchRequestEx = exRequestDispatcher( trackRequests );

/*
 * Converts an application-level Calypso action that's handled by the data-layer middleware
 * into a low-level action. For example, HTTP request that's being initiated, or a response
 * action with a `meta.dataLayer` property.
 */
function createRequestAction( options, action ) {
	const {
		fetch = noop,
		onSuccess = noop,
		onError = noop,
		onProgress = noop,
		fromApi = identity,
	} = options;

	const error = getError( action );
	if ( error ) {
		return onError( action, error );
	}

	const data = getData( action );
	if ( data ) {
		try {
			return onSuccess( action, fromApi( data ) );
		} catch ( err ) {
			return onError( action, err );
		}
	}

	const progress = getProgress( action );
	if ( progress ) {
		return onProgress( action, progress );
	}

	const fetchAction = fetch( action );
	if ( ! fetchAction ) {
		warn( "The `fetch` handler didn't return any action: no request will be issued" );
	}

	return fetchAction;
}
