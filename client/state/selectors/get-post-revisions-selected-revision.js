/** @format */
/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getEditorPostId } from 'client/state/ui/editor/selectors';
import { getPostRevision, getPostRevisionsSelectedRevisionId } from 'client/state/selectors';

export default function getPostRevisionsSelectedRevision( state ) {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const revisionId = getPostRevisionsSelectedRevisionId( state );
	return getPostRevision( state, siteId, postId, revisionId );
}
