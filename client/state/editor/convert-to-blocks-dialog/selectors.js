/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/editor/init';

export function isConvertToBlocksDialogDismissed( state, siteId, postId ) {
	return 'dismissed' === get( state, [ 'editor', 'convertToBlocksDialog', siteId, postId ] );
}
