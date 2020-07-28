/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/posts/init';

export function getPostRevisionsDiffView( state ) {
	return get( state, 'posts.revisions.ui.diffView', 'unified' );
}
