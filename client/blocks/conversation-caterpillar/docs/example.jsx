/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ConversationCaterpillar } from 'blocks/conversation-caterpillar';
import { posts } from 'blocks/reader-post-card/docs/fixtures';
import { commentsTree } from 'blocks/conversations/docs/fixtures';

const ConversationCaterpillarExample = () => {
	return (
		<div className="design-assets__group">
			<ConversationCaterpillar commentsTree={ commentsTree } blogId={ 123 } postId={ 12 } />
		</div>
	);
};

ConversationCaterpillarExample.displayName = 'ConversationCaterpillar';

export default ConversationCaterpillarExample;
