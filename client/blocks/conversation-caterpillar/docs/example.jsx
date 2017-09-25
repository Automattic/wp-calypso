/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { ConversationCaterpillar } from 'blocks/conversation-caterpillar';
import { comments, commentsTree } from 'blocks/conversation-caterpillar/docs/fixtures';
import { posts } from 'blocks/reader-post-card/docs/fixtures';

const ConversationCaterpillarExample = () => {
	return (
		<div className="design-assets__group">
			<ConversationCaterpillar
				comments={ comments }
				blogId={ 123 }
				postId={ 12 }
				commentsTree={ commentsTree }
				hiddenComments={ commentsTree }
				expandComments={ () => {} }
			/>
		</div>
	);
};

ConversationCaterpillarExample.displayName = 'ConversationCaterpillar';

export default ConversationCaterpillarExample;
