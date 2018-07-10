/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PostTypeSupportCheck from '../post-type-support-check';

export function PostLastRevisionCheck( { lastRevisionId, revisionsCount, children } ) {
	if ( ! lastRevisionId || revisionsCount < 2 ) {
		return null;
	}

	return <PostTypeSupportCheck supportKeys="revisions" >{ children }</PostTypeSupportCheck>;
}

export default withSelect(
	( select ) => {
		const { getCurrentPostLastRevisionId, getCurrentPostRevisionsCount } = select( 'core/editor' );
		return {
			lastRevisionId: getCurrentPostLastRevisionId(),
			revisionsCount: getCurrentPostRevisionsCount(),
		};
	}
)( PostLastRevisionCheck );
