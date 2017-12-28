/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ConversationCaterpillar } from 'client/blocks/conversation-caterpillar';
import { posts } from 'client/blocks/reader-post-card/docs/fixtures';
import { comments, commentsTree } from 'client/blocks/conversation-caterpillar/docs/fixtures';
import Card from 'client/components/card';

const ConversationCaterpillarExample = () => {
	return (
		<div className="design-assets__group">
			<Card>
				<ConversationCaterpillar
					comments={ comments }
					blogId={ 123 }
					postId={ 12 }
					commentsTree={ commentsTree }
					commentsToShow={ {} }
					expandComments={ () => {} }
				/>
			</Card>
		</div>
	);
};

ConversationCaterpillarExample.displayName = 'ConversationCaterpillar';

export default ConversationCaterpillarExample;
