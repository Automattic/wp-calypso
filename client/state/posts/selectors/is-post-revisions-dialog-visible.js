/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/posts/init';

export function isPostRevisionsDialogVisible( state ) {
	return get( state, 'posts.revisions.ui.isDialogVisible', false );
}
