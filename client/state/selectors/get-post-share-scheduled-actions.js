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

const getScheduledActions = ( state, siteId, postId ) =>
	orderBy(
		get( state, [ 'sharing', 'publicize', 'sharePostActions', 'scheduled', siteId, postId ], [] ),
		[ 'ID' ],
		[ 'desc' ]
	);

/**
 * Return a share-scheduled-actions array propagaring data from publicize connections.
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @param {number} postId Post ID
 * @returns {Array} share publihed actions array
 */
const getPostShareScheduledActions = createSelector(
	( state, siteId, postId ) => {
		const postShareActions = getScheduledActions( state, siteId, postId );
		return enrichPublicizeActionsWithConnections( state, postShareActions );
	},
	( state, siteId, postId ) => getScheduledActions( state, siteId, postId )
);

export default getPostShareScheduledActions;
