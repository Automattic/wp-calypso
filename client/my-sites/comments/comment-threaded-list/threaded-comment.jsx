/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { filter, map } from 'lodash';

/**
 * Internal dependencies
 */
import Comment from 'my-sites/comments/comment';
import Notice from 'components/notice';

export class ThreadedComment extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		commentsTree: PropTypes.array,
		depth: PropTypes.number,
	};

	state = {
		isExpanded: false,
	};

	showReplies = () => this.setState( { isExpanded: true } );

	render() {
		const { commentId, commentsTree, depth, translate } = this.props;
		const { isExpanded } = this.state;

		const replyTree = filter( commentsTree, { commentParentId: commentId } );

		return (
			<div className={ `comment-threaded-list__comment depth-${ depth }` }>
				<Comment { ...{ commentId } } isPostView refreshCommentData />

				{ !! replyTree.length &&
					! isExpanded && (
						<Notice
							className="comment-threaded-list__more-replies"
							icon="reply"
							showDismiss={ false }
						>
							<a onClick={ this.showReplies }>{ translate( 'Show replies' ) }</a>
						</Notice>
					) }

				{ isExpanded &&
					map( replyTree, ( { commentId: replyId } ) => (
						<LocalizedThreadedComment
							commentId={ replyId }
							commentsTree={ commentsTree }
							depth={ depth + 1 }
							key={ replyId }
						/>
					) ) }
			</div>
		);
	}
}

const LocalizedThreadedComment = localize( ThreadedComment );

export default LocalizedThreadedComment;
