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
				showCaterpillar={ false }
			/>
		</div>
	);
};

ConversationCommentListExample.displayName = 'ConversationCommentList';

export default ConversationCommentListExample;
