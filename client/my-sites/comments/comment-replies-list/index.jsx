/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { map, take } from 'lodash';

/**
 * Internal dependencies
 */
import Comment from 'my-sites/comments/comment';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import getSiteCommentParentDepth from 'state/selectors/get-site-comment-parent-depth';
import getSiteCommentRepliesTree from 'state/selectors/get-site-comment-replies-tree';

/**
 * Style dependencies
 */
import './style.scss';

export class CommentRepliesList extends Component {
	constructor( props ) {
		super( props );
		this.state = { showAllReplies: false };
	}

	toggleShowAllReplies = () =>
		this.setState( ( { showAllReplies } ) => ( { showAllReplies: ! showAllReplies } ) );

	render() {
		const maxDepth = 2;
		const { siteId, commentParentId, depth, replies, translate } = this.props;
		const { showAllReplies } = this.state;

		const repliesToShow = showAllReplies ? replies : take( replies, 5 );

		const classes = classNames( 'comment-replies-list', { 'is-nested': depth < maxDepth } );

		return (
			<div className={ classes }>
				{ ! showAllReplies && replies.length > 5 && (
					<Notice
						icon="chevron-down"
						showDismiss={ false }
						text={ translate( 'Show %(remainingReplies)d more replies', {
							args: { remainingReplies: replies.length - 5 },
						} ) }
					>
						<NoticeAction onClick={ this.toggleShowAllReplies }>
							{ translate( 'Show' ) }
						</NoticeAction>
					</Notice>
				) }
				{ map( repliesToShow, ( { commentId } ) => (
					<Comment
						commentId={ commentId }
						isAtMaxDepth={ depth >= maxDepth }
						isPostView={ true }
						key={ `comment-${ siteId }-${ commentParentId }-${ commentId }` }
						refreshCommentData={ true }
					/>
				) ) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId, commentParentId } ) => ( {
	commentParentId,
	depth: getSiteCommentParentDepth( state, siteId, commentParentId ),
	replies: getSiteCommentRepliesTree( state, siteId, 'all', commentParentId ),
} );

export default connect( mapStateToProps )( localize( CommentRepliesList ) );
