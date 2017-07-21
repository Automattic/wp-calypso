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

export class ConversationCommentList extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		commentIds: PropTypes.array.isRequired,
		post: PropTypes.object, // required by PostComment
	};

	render() {
		const { commentIds, commentsTree, post } = this.props;
		if ( ! commentIds ) {
			return null;
		}

		return (
			<div className="conversations__comment-list">
				{ map( commentIds, commentId =>
					// <PostComment
					// 	commentsTree={ commentsTree }
					// 	key={ commentId }
					// 	commentId={ commentId }
					// 	maxChildrenToShow={ 0 }
					// 	post={ post }
					// />,
					<div>
						{ commentId }
					</div>,
				) }
			</div>
		);
	}
}

const ConnectedConversationCommentList = connect( ( state, ownProps ) => {
	return {
		commentsTree: getPostCommentsTree( state, ownProps.blogId, ownProps.postId, 'all' ),
	};
} )( ConversationCommentList );

export default ConnectedConversationCommentList;
