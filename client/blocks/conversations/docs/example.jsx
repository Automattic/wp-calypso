/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ConversationCommentList } from 'blocks/conversations/list';
import { posts } from 'blocks/reader-post-card/docs/fixtures';

const ConversationCommentListExample = () => {
	const post = posts[ 0 ];
	const commentsTree = {
		1: {
			data: {
				ID: 1,
				content: '<p>Excellent!</p>',
				author: {
					name: 'Barnaby',
				},
				date: '2016-04-18T14:50:33+00:00',
			},
		},
		2: {
			data: {
				ID: 2,
				content: '<p>Marvellous!</p>',
				author: {
					name: 'Gertrude',
				},
				date: '2016-04-18T14:53:33+00:00',
			},
		},
		3: {
			data: {
				ID: 3,
				content: '<p>Splendid!</p>',
				author: {
					name: 'Minnie',
				},
				date: '2016-04-18T14:59:22+00:00',
			},
		},
	};

	return (
		<div className="design-assets__group">
			<ConversationCommentList
				commentsTree={ commentsTree }
				blogId={ 123 }
				postId={ 12 }
				commentIds={ [ 1, 2, 3 ] }
				post={ post }
			/>
		</div>
	);
};

ConversationCommentListExample.displayName = 'ConversationCommentList';

export default ConversationCommentListExample;
