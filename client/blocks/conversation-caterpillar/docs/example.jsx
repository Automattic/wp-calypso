/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ConversationCaterpillar } from 'blocks/conversation-caterpillar';
import { posts } from 'blocks/reader-post-card/docs/fixtures';

const ConversationCaterpillarExample = () => {
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
	};

	return (
		<div className="design-assets__group">
			<ConversationCaterpillar
				commentsTree={ commentsTree }
				blogId={ 123 }
				postId={ 12 }
				commentId={ 1 }
			/>
		</div>
	);
};

ConversationCaterpillarExample.displayName = 'ConversationCaterpillar';

export default ConversationCaterpillarExample;
