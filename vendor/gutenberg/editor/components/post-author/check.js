/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { withInstanceId } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PostTypeSupportCheck from '../post-type-support-check';

export function PostAuthorCheck( { hasAssignAuthorAction, authors, children } ) {
	if ( ! hasAssignAuthorAction || authors.length < 2 ) {
		return null;
	}

	return <PostTypeSupportCheck supportKeys="author">{ children }</PostTypeSupportCheck>;
}

export default compose( [
	withSelect( ( select ) => {
		const post = select( 'core/editor' ).getCurrentPost();
		return {
			hasAssignAuthorAction: get( post, [ '_links', 'wp:action-assign-author' ], false ),
			postType: select( 'core/editor' ).getCurrentPostType(),
			authors: select( 'core' ).getAuthors(),
		};
	} ),
	withInstanceId,
] )( PostAuthorCheck );
