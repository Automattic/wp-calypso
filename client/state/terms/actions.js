/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_SUCCESS,
	TERMS_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns an action object signalling that terms have been received for
 * the site and taxonomy.
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy Slug
 * @param  {Array}  terms    An array of term objects
 * @return {Object}          Action object
 */
export function receiveTerms( siteId, taxonomy, terms ) {
	return {
		type: TERMS_RECEIVE,
		siteId,
		taxonomy,
		terms
	};
}

/**
 * Returns an action thunk, dispatching progress of a request to retrieve terms
 * for a site and query options.
 *
 * @param  {Number}   siteId   Site ID
 * @param  {String}   taxonomy Taxonomy Slug
 * @param  {Object}   query    Query Options
 * @return {Function}        Action thunk
 */
export function requestSiteTerms( siteId, taxonomy, query = {} ) {
	return ( dispatch ) => {
		dispatch( {
			type: TERMS_REQUEST,
			siteId,
			taxonomy,
			query
		} );

		return wpcom.site( siteId ).taxonomy( taxonomy ).termsList( query ).then( ( data ) => {
			dispatch( receiveTerms( siteId, taxonomy, data.terms ) );
			dispatch( {
				type: TERMS_REQUEST_SUCCESS,
				siteId,
				taxonomy,
				query
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: TERMS_REQUEST_FAILURE,
				siteId,
				taxonomy,
				query,
				error
			} );
		} );
	};
}
