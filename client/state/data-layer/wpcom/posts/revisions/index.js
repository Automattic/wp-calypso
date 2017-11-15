/** @format */

/**
 * External dependencies
 */

import {
	flow,
	forEach,
	get,
	map,
	mapKeys,
	mapValues,
	omit,
	pick,
	omitBy,
	isUndefined,
} from 'lodash';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { countDiffWords, diffWords } from 'lib/text-utils';
import { POST_REVISIONS_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receivePostRevisions,
	receivePostRevisionsSuccess,
	receivePostRevisionsFailure,
} from 'state/posts/revisions/actions';

const diffKey = ( key, obj1, obj2 ) =>
	map( diffWords( get( obj1, key, '' ), get( obj2, key, '' ) ), change =>
		omitBy( change, isUndefined )
	);

/**
 * Normalize a WP REST API Post Revisions resource for consumption in Calypso
 *
 * @param {Object} revision Raw revision from the API
 * @returns {Object} the normalized revision
 */
export function normalizeRevision( revision ) {
	if ( ! revision ) {
		return revision;
	}

	return {
		...omit( revision, [
			'title',
			'content',
			'excerpt',
			'date',
			'date_gmt',
			'modified',
			'modified_gmt',
		] ),
		...flow(
			r => pick( r, [ 'title', 'content', 'excerpt' ] ),
			r => mapValues( r, ( val = {} ) => val.raw )
		)( revision ),
		...flow(
			r => pick( r, [ 'date_gmt', 'modified_gmt' ] ),
			r => mapValues( r, val => `${ val }Z` ),
			r => mapKeys( r, ( val, key ) => key.slice( 0, -'_gmt'.length ) )
		)( revision ),
	};
}

/**
 * Dispatches returned error from post revisions request
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @param {Object} rawError from HTTP request
 * @returns {Object} the dispatched action
 */
export const receiveError = ( { dispatch }, { siteId, postId }, rawError ) =>
	dispatch( receivePostRevisionsFailure( siteId, postId, rawError ) );

/**
 * Dispatches returned post revisions
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {String} action.siteId of the revisions
 * @param {String} action.postId of the revisions
 * @param {Array} revisions raw data from post revisions API
 */
export const receiveSuccess = ( { dispatch }, { siteId, postId }, revisions ) => {
	const normalizedRevisions = map( revisions, normalizeRevision );

	if ( isEnabled( 'post-editor/revisions' ) ) {
		forEach( normalizedRevisions, ( revision, index ) => {
			const previousRevision = get( normalizedRevisions, index + 1, {} );
			revision.changes = {
				title: diffKey( 'title', previousRevision, revision ),
				content: diffKey( 'content', previousRevision, revision ),
			};
			revision.summary = countDiffWords(
				revision.changes.title.concat( revision.changes.content )
			);
		} );
	}

	dispatch( receivePostRevisionsSuccess( siteId, postId ) );
	dispatch( receivePostRevisions( siteId, postId, normalizedRevisions ) );
};

/**
 * Dispatches a request to fetch post revisions
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
export const fetchPostRevisions = ( { dispatch }, action ) => {
	const { siteId, postId, postType } = action;
	const resourceName = postType === 'page' ? 'pages' : 'posts';
	dispatch(
		http(
			{
				path: `/sites/${ siteId }/${ resourceName }/${ postId }/revisions`,
				method: 'GET',
				query: {
					apiNamespace: 'wp/v2',
					context: 'edit',
				},
			},
			action
		)
	);
};

const dispatchPostRevisionsRequest = dispatchRequest(
	fetchPostRevisions,
	receiveSuccess,
	receiveError
);

export default {
	[ POST_REVISIONS_REQUEST ]: [ dispatchPostRevisionsRequest ],
};
