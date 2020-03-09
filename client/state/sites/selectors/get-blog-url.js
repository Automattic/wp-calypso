/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal deependencies
 */
import 'state/sites/init';

export default function getBlogUrl( state, blogId ) {
	return get( state, [ 'sites', 'items', blogId, 'URL' ], false );
}
