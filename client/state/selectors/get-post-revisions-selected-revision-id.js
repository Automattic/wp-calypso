/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

const getPostRevisionsSelectedRevisionId = state => {
	return get( state, 'posts.revisions.selection.revisionId', 0 );
};
export default getPostRevisionsSelectedRevisionId;
