/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal Dependencies
 */
import ConversationPostList from 'blocks/conversations/list';
import CompactPostCard from 'blocks/reader-post-card/compact';
import { CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING } from 'state/reader/conversations/follow-status';

class ConversationPost extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		commentIds: PropTypes.array.isRequired,
	};

	render() {
		return (
			<div className="reader-post-card__conversation-post">
				<CompactPostCard
					{ ...this.props }
					defaultConversationFollowStatus={ CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING }
				/>
				<ConversationPostList post={ this.props.post } commentIds={ this.props.commentIds } />
			</div>
		);
	}
}

export default ConversationPost;
