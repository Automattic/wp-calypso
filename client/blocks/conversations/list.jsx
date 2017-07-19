/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/***
 * Internal dependencies
 */
//import PostComment from 'blocks/comments/post-comment';
import { getPostCommentsTree } from 'state/comments/selectors';

class ConversationCommentList extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		commentIds: PropTypes.array,
	};

	render() {
		return <div className="conversations__comment-list">Conversation comment list</div>;
	}
}

export default connect( ( state, ownProps ) => {
	return {
		commentsTree: getPostCommentsTree( state, ownProps.blogId, ownProps.postId, 'all' ),
		//comments: getCommentsById( ownProps.blogId, ownProps.commentIds ),
	};
} )( ConversationCommentList );
