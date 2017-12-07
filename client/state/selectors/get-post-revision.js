/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { hydrateRevision, normalizeRevision } from 'state/selectors/utils/revisions';

const getPostRevision = createSelector(
	( state, siteId, postId, revisionId, normalizerName = null ) =>
		normalizeRevision(
			normalizerName,
			hydrateRevision(
				state,
				get( state.posts.revisions.diffs, [ siteId, postId, 'revisions', revisionId ], null )
			)
		),
	state => [ state.posts.revisions.diffs ]
);

export default getPostRevision;
