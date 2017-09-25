/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ConversationPostList from 'blocks/conversations/list';
import CompactPostCard from 'blocks/reader-post-card/compact';

class ConversationPost extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		commentIds: PropTypes.array.isRequired,
	};

	render() {
		return (
			<div className="reader-post-card__conversation-post">
				<CompactPostCard { ...this.props } />
				<ConversationPostList post={ this.props.post } commentIds={ this.props.commentIds } />
			</div>
		);
	}
}

export default ConversationPost;
