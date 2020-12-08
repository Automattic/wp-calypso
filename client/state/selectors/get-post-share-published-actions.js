/**
 * External dependencies
 */
import { get, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import { enrichPublicizeActionsWithConnections } from 'calypso/state/selectors/utils/';
import createSelector from 'calypso/lib/create-selector';

import 'calypso/state/sharing/init';

const getPublishedActions = ( state, siteId, postId ) =>
	orderBy(
		get( state, [ 'sharing', 'publicize', 'sharePostActions', 'published', siteId, postId ], [] ),
		[ 'share_date' ],
		[ 'desc' ]
	);

/**
 * Return a share-published-actions array propagaring data from publicize connections.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @returns {Array} share publihed actions array
 */
const getPostSharePublishedActions = createSelector(
	( state, siteId, postId ) => {
		const postShareActions = getPublishedActions( state, siteId, postId );
		return enrichPublicizeActionsWithConnections( state, postShareActions );
	},
	( state, siteId, postId ) => getPublishedActions( state, siteId, postId )
);

export default getPostSharePublishedActions;
