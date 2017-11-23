/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { drop, filter, isUndefined, map } from 'lodash';

/**
 * Internal dependencies
 */
import Comment from 'my-sites/comments/comment';
import Notice from 'components/notice';
import { getSiteComment } from 'state/selectors';

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
		const { commentId, commentsTree, depth, isLoading, siteId, translate } = this.props;
		const { isExpanded } = this.state;

		const replyTree = filter( commentsTree, { commentParentId: commentId } );

		return (
			<div className={ `comment-threaded-list__comment depth-${ depth }` }>
				<Comment { ...{ commentId } } isPostView refreshCommentData />

				{ !! replyTree.length && (
					<ConnectedThreadedComment
						commentId={ replyTree[ 0 ].commentId }
						commentsTree={ commentsTree }
						depth={ depth + 1 }
						key={ replyTree[ 0 ].commentId }
						siteId={ siteId }
					/>
				) }

				{ ! isLoading &&
					! isExpanded &&
					replyTree.length > 1 && (
						<Notice
							className="comment-threaded-list__more-replies"
							icon="reply"
							showDismiss={ false }
						>
							<a onClick={ this.showReplies }>{ translate( 'Load more replies' ) }</a>
						</Notice>
					) }

				{ isExpanded &&
					map( drop( replyTree ), ( { commentId: replyId } ) => (
						<ConnectedThreadedComment
							commentId={ replyId }
							commentsTree={ commentsTree }
							depth={ depth + 1 }
							key={ replyId }
							siteId={ siteId }
						/>
					) ) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, commentId } ) => ( {
	isLoading: isUndefined( getSiteComment( state, siteId, commentId ) ),
} );

const ConnectedThreadedComment = connect( mapStateToProps )( localize( ThreadedComment ) );

export default ConnectedThreadedComment;
