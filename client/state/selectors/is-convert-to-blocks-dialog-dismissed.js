/**
 * External dependencies
 */
import { get } from 'lodash';

export default function isConvertToBlocksDialogDismissed( state, siteId, postId ) {
	return 'dismissed' === get( state, [ 'ui', 'convertToBlocksDialog', siteId, postId ] );
}
