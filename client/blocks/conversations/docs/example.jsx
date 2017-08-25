/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ConversationCommentList } from 'blocks/conversations/list';
import { posts } from 'blocks/reader-post-card/docs/fixtures';
import { commentsTree } from 'blocks/conversations/docs/fixtures';

const blogId = 3584907;
const postId = 39375;

const ConversationCommentListExample = () => {
	const post = posts[ 0 ];

	return (
		<div className="design-assets__group">
			<ConversationCommentList
				commentsTree={ commentsTree }
				blogId={ blogId }
				postId={ postId }
				commentIds={ [ 1, 2, 3 ] }
				post={ post }
				showCaterpillar={ true }
			/>
		</div>
	);
};

ConversationCommentListExample.displayName = 'ConversationCommentList';

export default ConversationCommentListExample;
