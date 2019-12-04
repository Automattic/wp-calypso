/**
 * External dependencies
 */
import { get } from 'lodash';

const getPostRevisionsDiffView = state => {
	return get( state, 'posts.revisions.ui.diffView', 'unified' );
};

export default getPostRevisionsDiffView;
