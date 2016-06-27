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
	TERM_REMOVE,
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

		dispatch( receiveTerm( siteId, taxonomy, {
			...term,
			ID: temporaryId
		} ) );

		return wpcom.site( siteId ).taxonomy( taxonomy ).term().add( term ).then(
			( data ) => dispatch( receiveTerm( siteId, taxonomy, omit( data, '_headers' ) ) ),
			() => Promise.resolve() // Silently ignore failure so we can proceed to remove temporary
		).then( () => dispatch( removeTerm( siteId, taxonomy, temporaryId ) ) );
	};
}

/**
 * Returns an action object signalling that a term has been received
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy Slug
 * @param  {Object} term     Term object
 * @return {Object}          Action object
 */
export function receiveTerm( siteId, taxonomy, term ) {
	return receiveTerms( siteId, taxonomy, [ term ] );
}

/**
 * Returns an action object signalling that terms have been received for
 * the site and taxonomy.
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy Slug
 * @param  {Array}  terms    An array of term objects
 * @param  {Object} query    Query Options
 * @param  {Number} found    Total terms found for query
 * @return {Object}          Action object
 */
export function receiveTerms( siteId, taxonomy, terms, query, found ) {
	return {
		type: TERMS_RECEIVE,
		siteId,
		taxonomy,
		terms,
		query,
		found
	};
}

/**
 * Returns an action object signalling that a term is to be removed
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy Slug
 * @param  {Number} termId   Term ID
 * @return {Object}          Action object
 */
export function removeTerm( siteId, taxonomy, termId ) {
	return {
		type: TERM_REMOVE,
		siteId,
		taxonomy,
		termId
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
			dispatch( {
				type: TERMS_REQUEST_SUCCESS,
				siteId,
				taxonomy,
				query
			} );
			dispatch( receiveTerms( siteId, taxonomy, data.terms, query, data.found ) );
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
