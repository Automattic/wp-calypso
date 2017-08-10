/** @format */
/**
 * External dependencies
 */
import { get, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import { enrichPublicizeActionsWithConnections } from 'state/selectors/utils/';
import createSelector from 'lib/create-selector';

const getPublishedActions = ( state, siteId, postId ) =>
	orderBy(
		get( state, [ 'sharing', 'publicize', 'sharePostActions', 'published', siteId, postId ], [] ),
		[ 'share_date' ],
		[ 'desc' ]
	);

/**
 * Return a share-published-actions array propagaring data from publicize connections.
 *
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @return {Array} share publihed actions array
 */
const getPostSharePublishedActions = createSelector(
	( state, siteId, postId ) => {
		const postShareActions = getPublishedActions( state, siteId, postId );
		return enrichPublicizeActionsWithConnections( state, postShareActions );
	},
	( state, siteId, postId ) => getPublishedActions( state, siteId, postId )
);

export default getPostSharePublishedActions;
