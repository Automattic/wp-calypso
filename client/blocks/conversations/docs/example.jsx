/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ConversationCommentList } from 'blocks/conversations/list';

const ConversationCommentListExample = () => {
	const commentsTree = {
		'123-12': [
			{
				ID: 1,
				content: '<p>Good!</p>',
			},
			{
				ID: 2,
				content: '<p>Good!</p>',
			},
			{
				ID: 3,
				content: '<p>Good!</p>',
			},
		],
	};

	return (
		<div className="design-assets__group">
			<ConversationCommentList
				commentsTree={ commentsTree }
				blogId={ 123 }
				postId={ 12 }
				commentIds={ [ 1, 2, 3 ] }
			/>
		</div>
	);
};

ConversationCommentListExample.displayName = 'ConversationCommentList';

export default ConversationCommentListExample;
