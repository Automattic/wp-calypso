/**
 * External dependencies
 */
import { isNumber, toArray } from 'lodash';

/**
 * Internal dependencies
 */
import { TERMS_RECEIVE } from 'state/action-types';
import { getEditedPost } from 'state/posts/selectors';
import { editPost } from 'state/posts/actions';

/**
 * Dispatches editPost when a new term has been added
 * that also has a postId on the action
 *
 * @param  {Function} dispatch  Dispatch method
 * @param  {Object}   state     Global state tree
 * @param  {Object}   action    Action object
 */
export function onTermsReceive( dispatch, state, action ) {
	const { postId, taxonomy, terms, siteId } = action;
	const post = getEditedPost( state, siteId, postId );
	const newTerm = terms[ 0 ];

	// if there is no post, no term, or term is temporary, bail
	if ( ! post || ! newTerm || ! isNumber( newTerm.ID ) ) {
		return;
	}

	const postTerms = post.terms || {};

	// ensure we have an array since API returns an object
	const taxonomyTerms = toArray( postTerms[ taxonomy ] );
	taxonomyTerms.push( newTerm );

	dispatch( editPost( {
		terms: {
			[ taxonomy ]: taxonomyTerms
		}
	}, siteId, postId ) );
}

export default ( { dispatch, getState } ) => ( next ) => ( action ) => {
	if ( TERMS_RECEIVE === action.type && action.hasOwnProperty( 'postId' ) ) {
		onTermsReceive( dispatch, getState(), action );
	}
	return next( action );
};
