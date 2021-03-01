/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getPostRevision } from 'calypso/state/posts/selectors/get-post-revision';
import { getPostRevisionsSelectedRevisionId } from 'calypso/state/posts/selectors/get-post-revisions-selected-revision-id';

export function getPostRevisionsSelectedRevision( state ) {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const revisionId = getPostRevisionsSelectedRevisionId( state );
	return getPostRevision( state, siteId, postId, revisionId );
}
