/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/posts/init';

const getPostRevisionsDiffView = ( state ) => {
	return get( state, 'posts.revisions.ui.diffView', 'unified' );
};

export default getPostRevisionsDiffView;
