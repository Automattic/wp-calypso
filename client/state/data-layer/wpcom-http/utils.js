/**
 * External dependencies
 */
import schemaValidator from 'is-my-json-valid';
import { get, identity, noop } from 'lodash';

/**
 * Returns response data from an HTTP request success action if available
 *
 * @param {Object} action may contain HTTP response data
 * @returns {?*} response data if available
 */
export const getData = action => get( action, 'meta.dataLayer.data', null );

/**
 * Returns error data from an HTTP request failure action if available
 *
 * @param {Object} action may contain HTTP response error data
 * @returns {?*} error data if available
 */
export const getError = action => get( action, 'meta.dataLayer.error', null );

/**
 * Returns (response) headers data from an HTTP request action if available
 *
 * @param {Object} action may contain HTTP response headers data
 * @returns {?*} headers data if available
 */
export const getHeaders = action => get( action, 'meta.dataLayer.headers', null );

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
export const getProgress = action => get( action, 'meta.dataLayer.progress', null );

class SchemaError extends Error {
	constructor( errors ) {
		super( 'Failed to validate with JSON schema' );
		this.schemaErrors = errors;
	}
}

class TransformerError extends Error {
	constructor( error, transformer, data ) {
		super( error.message );
		this.transformer = transformer;
		this.inputData = data;
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
			throw new TransformerError( e, transformer, data );
		}
	};

	// the actual parser
	return data => transform( validate( data ) );
};

/**
 * @type Object default dispatchRequest options
 * @property {Function} fromApi validates and transforms API response data
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
 * @param {Function} initiator called if action lacks response meta; should create HTTP request
 * @param {Function} onSuccess called if the action meta includes response data
 * @param {Function} onError called if the action meta includes error data
 * @param {Object} options configures additional dispatching behaviors
 + @param {Function} [options.fromApi] maps between API data and Calypso data
 + @param {Function} [options.onProgress] called on progress events when uploading
 * @returns {?*} please ignore return values, they are undefined
 */
export const dispatchRequest = ( initiator, onSuccess, onError, options ) => ( store, action ) => {
	const { fromApi, onProgress } = { ...defaultOptions, ...options };

	const error = getError( action );
	if ( error ) {
		return onError( store, action, error );
	}

	const data = getData( action );
	if ( data ) {
		try {
			return onSuccess( store, action, fromApi( data ) );
		} catch ( err ) {
			return onError( store, action, err );
		}
	}

	const progress = getProgress( action );
	if ( progress ) {
		return onProgress( store, action, progress );
	}

	return initiator( store, action );
};
