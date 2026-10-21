import { Card } from '@automattic/components';
import { ConversationCaterpillar } from 'calypso/blocks/conversation-caterpillar';
import { comments, commentsTree } from 'calypso/blocks/conversation-caterpillar/docs/fixtures';

const ConversationCaterpillarExample = () => {
	return (
		<div className="design-assets__group">
			<Card>
				<ConversationCaterpillar
					comments={ comments }
					blogId={ 123 }
					postId={ 12 }
					commentsTree={ commentsTree }
					commentCount={ comments.length }
					commentsToShow={ {} }
					expandComments={ () => {} }
				/>
			</Card>
		</div>
	);
};

ConversationCaterpillarExample.displayName = 'ConversationCaterpillar';

export default ConversationCaterpillarExample;
