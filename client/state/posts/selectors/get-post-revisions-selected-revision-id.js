/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/posts/init';

export function getPostRevisionsSelectedRevisionId( state ) {
	return get( state, 'posts.revisions.selection.revisionId' );
}
