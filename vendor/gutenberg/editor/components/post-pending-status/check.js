/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

export function PostPendingStatusCheck( { hasPublishAction, isPublished, children } ) {
	if ( isPublished || ! hasPublishAction ) {
		return null;
	}

	return children;
}

export default compose(
	withSelect( ( select ) => {
		const { isCurrentPostPublished, getCurrentPostType, getCurrentPost } = select( 'core/editor' );
		return {
			hasPublishAction: get( getCurrentPost(), [ '_links', 'wp:action-publish' ], false ),
			isPublished: isCurrentPostPublished(),
			postType: getCurrentPostType(),
		};
	} )
)( PostPendingStatusCheck );
