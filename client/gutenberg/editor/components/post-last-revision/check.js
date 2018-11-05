/** @format */
/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import React from 'react';

/**
 * Internal dependencies
 */
import { PostTypeSupportCheck } from '@wordpress/editor';

export function PostLastRevisionCheck( { lastRevisionId, revisionsCount, children } ) {
	if ( ! lastRevisionId || revisionsCount < 2 ) {
		return null;
	}

	return <PostTypeSupportCheck supportKeys="revisions">{ children }</PostTypeSupportCheck>;
}

export default withSelect( select => {
	const { getCurrentPostLastRevisionId, getCurrentPostRevisionsCount } = select( 'core/editor' );
	return {
		lastRevisionId: getCurrentPostLastRevisionId(),
		revisionsCount: getCurrentPostRevisionsCount(),
	};
} )( PostLastRevisionCheck );
