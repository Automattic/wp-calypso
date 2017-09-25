/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { commentsTree } from 'blocks/conversations/docs/fixtures';
import { ConversationCommentList } from 'blocks/conversations/list';
import { posts } from 'blocks/reader-post-card/docs/fixtures';

const ConversationCommentListExample = () => {
	const post = posts[ 0 ];

	return (
		<div className="design-assets__group">
			<ConversationCommentList
				commentsTree={ commentsTree }
				blogId={ 123 }
				postId={ 12 }
				commentIds={ [ 1, 2, 3 ] }
				post={ post }
				enableCaterpillar={ false }
				shouldRequestComments={ false }
			/>
		</div>
	);
};

ConversationCommentListExample.displayName = 'ConversationCommentList';

export default ConversationCommentListExample;
