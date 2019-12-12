/**
 * External dependencies
 */
import { get } from 'lodash';

export default function getPostRevisionsDiff(
	state,
	siteId,
	postId,
	fromRevisionId,
	toRevisionId
) {
	const key = `${ fromRevisionId || 0 }:${ toRevisionId || 0 }`;
	return get( state.posts.revisions.diffs, [ siteId, postId, key, 'diff' ], {} );
}
