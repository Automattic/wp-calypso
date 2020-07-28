/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/editor/selectors';
import { getPostRevision } from 'state/posts/selectors/get-post-revision';
import { getPostRevisionsSelectedRevisionId } from 'state/posts/selectors/get-post-revisions-selected-revision-id';

export function getPostRevisionsSelectedRevision( state ) {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const revisionId = getPostRevisionsSelectedRevisionId( state );
	return getPostRevision( state, siteId, postId, revisionId );
}
