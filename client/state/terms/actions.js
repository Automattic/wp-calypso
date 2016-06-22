/**
 * External dependencies
 */
import omit from 'lodash/omit';
import uniqueId from 'lodash/uniqueId';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	TERMS_ADD_REQUEST,
	TERMS_ADD_REQUEST_SUCCESS,
	TERMS_ADD_REQUEST_FAILURE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_SUCCESS,
	TERMS_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns an action thunk, dispatching progress of a request to add a new term
 * the site and taxonomy.
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy Slug
 * @param  {Object} term     Object of new term attributes
 * @return {Object}          Action object
 */
export function addTerm( siteId, taxonomy, term ) {
	return ( dispatch ) => {
		const temporaryId = uniqueId( 'temporary' );

		dispatch( {
			type: TERMS_ADD_REQUEST,
			temporaryId,
			siteId,
			taxonomy,
			term
		} );

		return wpcom.site( siteId ).taxonomy( taxonomy ).term().add( term ).then( ( data ) => {
			dispatch( {
				type: TERMS_ADD_REQUEST_SUCCESS,
				data: omit( data, '_headers' ),
				temporaryId,
				siteId,
				taxonomy,
				term
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: TERMS_ADD_REQUEST_FAILURE,
				temporaryId,
				siteId,
				taxonomy,
				term,
				error
			} );
		} );
	};
}

/**
 * Returns an action object signalling that terms have been received for
 * the site and taxonomy.
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy Slug
 * @param  {Array}  terms    An array of term objects
 * @param  {Object} query    Query Options
 * @return {Object}          Action object
 */
export function receiveTerms( siteId, taxonomy, terms, query ) {
	return {
		type: TERMS_RECEIVE,
		siteId,
		taxonomy,
		terms,
		query
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
			dispatch( receiveTerms( siteId, taxonomy, data.terms, query ) );
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
