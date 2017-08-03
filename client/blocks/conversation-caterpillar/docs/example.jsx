/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ConversationCaterpillar } from 'blocks/conversation-caterpillar';
import { posts } from 'blocks/reader-post-card/docs/fixtures';
import { comments } from 'blocks/conversation-caterpillar/docs/fixtures';

const ConversationCaterpillarExample = () => {
	return (
		<div className="design-assets__group">
			<ConversationCaterpillar comments={ comments } blogId={ 123 } postId={ 12 } />
		</div>
	);
};

ConversationCaterpillarExample.displayName = 'ConversationCaterpillar';

export default ConversationCaterpillarExample;
