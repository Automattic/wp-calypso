/**
 * External dependencies
 */
import { get } from 'lodash';

export default function isPostRevisionsDialogVisible( state ) {
	return get( state, 'posts.revisions.ui.isDialogVisible', false );
}
