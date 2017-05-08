/**
 * External dependencies
 */
import { filter, get, uniqueId } from 'lodash';

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
import { editPost } from 'state/posts/actions';
import { updateSiteSettings } from 'state/site-settings/actions';
import { getSitePostsByTerm } from 'state/posts/selectors';
import { getSiteSettings } from 'state/site-settings/selectors';
import { getTerm, getTerms } from './selectors';

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
			( data ) => {
				dispatch( receiveTerm( siteId, taxonomy, data ) );
				return data;
			},
			() => Promise.resolve() // Silently ignore failure so we can proceed to remove temporary
		).then( data => {
			dispatch( removeTerm( siteId, taxonomy, temporaryId ) );
			return data;
		} );
	};
}

/**
 * Returns an action thunk, editing a term and dispatching the updated term to the store
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy Slug
 * @param  {Number} termId   term Id
 * @param  {String} termSlug term Slug
 * @param  {Object} term     Object of new term attributes
 * @return {Object}          Action object
 */
export function updateTerm( siteId, taxonomy, termId, termSlug, term ) {
	return ( dispatch, getState ) => {
		return wpcom.site( siteId ).taxonomy( taxonomy ).term( termSlug ).update( term ).then(
			( updatedTerm ) => {
				const state = getState();
				// When updating a term, we receive a newId and a new Slug
				// We have to remove the old term and add the new one
				// We also have to update the parent ID of its children
				const children = filter( getTerms( state, siteId, taxonomy ), { parent: termId } )
					.map( child => ( { ...child, parent: updatedTerm.ID } ) );
				dispatch( removeTerm( siteId, taxonomy, termId ) );
				dispatch( receiveTerms( siteId, taxonomy, children.concat( [ updatedTerm ] ) ) );

				// We also have to update post terms
				const postsToUpdate = getSitePostsByTerm( state, siteId, taxonomy, termId );
				postsToUpdate.forEach( post => {
					const newTerms = filter( post.terms[ taxonomy ], postTerm => postTerm.ID !== termId );
					newTerms.push( updatedTerm );
					dispatch( editPost( siteId, post.ID, {
						terms: {
							[ taxonomy ]: newTerms
						}
					} ) );
				} );

				// Update the default category if needed
				const siteSettings = getSiteSettings( state, siteId );
				if (
					taxonomy === 'category' &&
					get( siteSettings, [ 'default_category' ] ) === termId &&
					updatedTerm.ID !== termId
				) {
					dispatch( updateSiteSettings( siteId, { default_category: updatedTerm.ID } ) );
				}

				return updatedTerm;
			}
		);
	};
}

/**
 * Returns an action thunk, deleting a term and removing it from the store
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} taxonomy Taxonomy Slug
 * @param  {Number} termId   term Id
 * @param  {String} termSlug term Slug
 * @return {Object}          Action object
 */
export function deleteTerm( siteId, taxonomy, termId, termSlug ) {
	return ( dispatch, getState ) => {
		return wpcom.site( siteId ).taxonomy( taxonomy ).term( termSlug ).delete().then(
			() => {
				const state = getState();
				const deletedTerm = getTerm( state, siteId, taxonomy, termId );
				const deletedTermPostCount = get( deletedTerm, 'post_count', 0 );

				// Update the parentId of its children
				const termsToUpdate = filter( getTerms( state, siteId, taxonomy ), term => {
					return term.parent === termId;
				} ).map( term => {
					return { ...term, parent: deletedTerm.parent };
				} );
				if ( termsToUpdate.length ) {
					dispatch( receiveTerms( siteId, taxonomy, termsToUpdate ) );
				}

				// Drop the term from posts
				const postsToUpdate = getSitePostsByTerm( state, siteId, taxonomy, termId );
				postsToUpdate.forEach( post => {
					const newTerms = filter( post.terms[ taxonomy ], postTerm => postTerm.ID !== termId );
					dispatch( editPost( siteId, post.ID, {
						terms: {
							[ taxonomy ]: newTerms
						}
					} ) );
				} );

				// update default category post count if applicable
				if ( taxonomy === 'category' && deletedTermPostCount > 0 ) {
					const siteSettings = getSiteSettings( state, siteId );
					const defaultCategory = getTerm( state, siteId, taxonomy, get( siteSettings, [ 'default_category' ] ) );
					if ( defaultCategory ) {
						dispatch(
							receiveTerm(
								siteId,
								taxonomy,
								{ ...defaultCategory, post_count: defaultCategory.post_count + deletedTermPostCount }
							)
						);
					}
				}

				// remove the term from the store
				dispatch( removeTerm( siteId, taxonomy, termId ) );
			}
		);
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
