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
		post: PropTypes.object.isRequired, // required by PostComment
		commentIds: PropTypes.array.isRequired,
	};

	render() {
		const { commentIds, commentsTree, post } = this.props;
		if ( ! commentIds ) {
			return null;
		}

		return (
			<ul className="conversations__comment-list">
				{ map( commentIds, commentId => {
					return (
						<PostComment
							commentsTree={ commentsTree }
							key={ commentId }
							commentId={ commentId }
							maxChildrenToShow={ 0 }
							post={ post }
						/>
					);
				} ) }
			</ul>
		);
	}
}

const ConnectedConversationCommentList = connect( ( state, ownProps ) => {
	const { site_ID: siteId, ID: postId } = ownProps.post;

	return {
		commentsTree: getPostCommentsTree( state, siteId, postId, 'all' ),
	};
} )( ConversationCommentList );

export default ConnectedConversationCommentList;
