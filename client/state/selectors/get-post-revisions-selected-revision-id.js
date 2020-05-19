/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/posts/init';

const getPostRevisionsSelectedRevisionId = ( state ) => {
	return get( state, 'posts.revisions.selection.revisionId' );
};
export default getPostRevisionsSelectedRevisionId;
