/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

/***
 * Internal dependencies
 */
import PostComment from 'blocks/comments/post-comment';
import { getPostCommentsTree } from 'state/comments/selectors';

class ConversationCommentList extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		commentIds: PropTypes.array.isRequired,
	};

	render() {
		const { commentIds, commentsTree } = this.props.commentIds;
		if ( ! commentIds ) {
			return null;
		}

		return (
			<div className="conversations__comment-list">
				{ map( commentIds, commentId =>
					<PostComment
						commentsTree={ commentsTree }
						key={ commentId }
						commentId={ commentId }
						maxChildrenToShow={ 0 }
					/>,
				) }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		commentsTree: getPostCommentsTree( state, ownProps.blogId, ownProps.postId, 'all' ),
	};
} )( ConversationCommentList );
