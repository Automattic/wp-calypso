/**
 * External dependencies
 */
import { isNumber, toArray } from 'lodash';

/**
 * Internal dependencies
 */
import { editPost } from 'calypso/state/posts/actions/edit-post';
import { getEditedPost } from 'calypso/state/posts/selectors';

import 'calypso/state/posts/init';

/**
 * Returns an action thunk which, when dispatched, adds a term to the current edited post
 *
 * @param  {number}   siteId   Site ID
 * @param  {string}   taxonomy Taxonomy Slug
 * @param  {object}   term     Object of new term attributes
 * @param  {number}   postId   ID of post to which term is associated
 * @returns {Function}          Action thunk
 */
export function addTermForPost( siteId, taxonomy, term, postId ) {
	return ( dispatch, getState ) => {
		const state = getState();
		const post = getEditedPost( state, siteId, postId );

		// if there is no post, no term, or term is temporary, bail
		if ( ! post || ! term || ! isNumber( term.ID ) ) {
			return;
		}

		const postTerms = post.terms || {};

		// ensure we have an array since API returns an object
		const taxonomyTerms = toArray( postTerms[ taxonomy ] );
		taxonomyTerms.push( term );

		dispatch(
			editPost( siteId, postId, {
				terms: {
					[ taxonomy ]: taxonomyTerms,
				},
			} )
		);
	};
}
