import { get } from 'lodash';

import 'calypso/state/posts/init';

export function getPostRevisionsSelectedRevisionId( state ) {
	return get( state, 'posts.revisions.selection.revisionId' );
}
