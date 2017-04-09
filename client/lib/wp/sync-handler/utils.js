/**
 * External dependencies
 */
import sha1 from 'js-sha1';
import qs from 'querystring';
import deterministicStringify from 'lib/deterministic-stringify';


/**
 * Internal dependencies
 */
import { SYNC_RECORD_NAMESPACE } from './constants';

/**
 * Generate a key from the given param object
 *
 * @param {Object} params - request parameters
 * @param {Boolean} applyHash - codificate key when it's true
 * @return {String} request key
 */
export const generateKey = ( params, applyHash = true ) => {
	var key = `${params.apiVersion || ''}-${params.method}-${params.path}`;

	if ( params.query ) {
		// sort parameters alphabetically
		key += '-' + deterministicStringify( qs.parse( params.query ) );
	}

	if ( applyHash ) {
		const hash = sha1.create();
		hash.update( key );
		key = hash.hex();
	}

	key = SYNC_RECORD_NAMESPACE + key;
	return key;
}

/**
 * Generate pageSeriesKey from request parameters
 * @param  {Object} reqParams - request parameters
 * @return {String}        - pageSeriesKey string
 */
export const generatePageSeriesKey = ( reqParams ) => {
	const queryParams = qs.parse( reqParams.query );
	delete queryParams.page_handle;
	const paramsWithoutPage = Object.assign( {}, reqParams, { query: qs.stringify( queryParams ) } );
	return generateKey( paramsWithoutPage );
}

/**
 * generate normalized reqestParams object
 * @param {Object} reqParams - request parameters
 * @return {Object} - request params in a more usable format
 */
export const normalizeRequestParams = ( reqParams ) => {
	const query = qs.parse( reqParams.query );
	const normalizedParams = Object.assign( {}, reqParams, { query } );
	delete normalizedParams.supports_args;
	delete normalizedParams.supports_progress;
	return normalizedParams;
}
