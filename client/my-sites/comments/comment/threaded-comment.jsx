/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Comment from 'my-sites/comments/comment';

export class ThreadedComment extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		commentsTree: PropTypes.object,
		depth: PropTypes.number,
	};

	renderRepliesList() {
		const { commentId, commentsTree, depth } = this.props;

		const repliesId = get( commentsTree, [ commentId, 'children' ] );
		if ( ! repliesId || repliesId.length < 1 ) {
			return null;
		}

		return (
			<div className="comment__threaded-replies">
				{ repliesId.map( replyId => (
					<ThreadedComment
						commentId={ replyId }
						commentsTree={ commentsTree }
						depth={ depth + 1 }
						key={ replyId }
					/>
				) ) }
			</div>
		);
	}

	render() {
		const { commentId, depth } = this.props;

		return (
			<div className={ `comment__threaded-comment depth-${ depth }` }>
				<Comment commentId={ commentId } isPostView refreshCommentData />

				{ this.renderRepliesList() }
			</div>
		);
	}
}

//const RecursiveThreadedComment = ThreadedComment;

export default ThreadedComment;
