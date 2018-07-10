/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

export function PostStickyCheck( { hasStickyAction, postType, children } ) {
	if (
		postType !== 'post' ||
		! hasStickyAction
	) {
		return null;
	}

	return children;
}

export default compose( [
	withSelect( ( select ) => {
		const post = select( 'core/editor' ).getCurrentPost();
		return {
			hasStickyAction: get( post, [ '_links', 'wp:action-sticky' ], false ),
			postType: select( 'core/editor' ).getCurrentPostType(),
		};
	} ),
] )( PostStickyCheck );
