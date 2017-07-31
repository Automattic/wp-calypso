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
					avatar_URL:
						'https://2.gravatar.com/avatar/5512fbf07ae3dd340fb6ed4924861c8e?s=96&d=identicon&r=G',
				},
				date: '2016-04-18T14:50:33+00:00',
			},
		},
		2: {
			data: {
				ID: 2,
				content: '<p>Tremendous!</p>',
				author: {
					name: 'Gertrude',
					avatar_URL: 'https://2.gravatar.com/avatar/22d41e5b6ff197cd7900c0514d1bd305?d=mm&r=G',
				},
				date: '2016-04-18T14:50:33+00:00',
			},
		},
		3: {
			data: {
				ID: 3,
				content: '<p>Splendid!</p>',
				author: {
					name: 'Minnie',
					avatar_URL: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?d=mm&r=G',
				},
				date: '2016-04-18T14:59:22+00:00',
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
