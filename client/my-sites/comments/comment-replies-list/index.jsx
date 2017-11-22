/** @format */

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
import { getSiteCommentParentDepth, getSiteCommentRepliesTree } from 'state/selectors';

export class CommentRepliesList extends Component {
	constructor( props ) {
		super( props );
		this.state = { showAllReplies: false };
	}

	toggleShowAllRepliesReplies = () =>
		this.setState( ( { showAllReplies } ) => ( { showAllReplies: ! showAllReplies } ) );

	render() {
		const { siteId, commentParentId, depth, replies, translate } = this.props;
		const { showAllReplies } = this.state;

		const repliesToShow = showAllReplies ? replies : take( replies, 5 );

		const classes = classNames( { 'comment-replies-list': depth < 2 } );

		return (
			<div className={ classes }>
				{ map( repliesToShow, ( { commentId } ) => (
					<Comment
						commentId={ commentId }
						key={ `comment-${ siteId }-${ commentParentId }-${ commentId }` }
						refreshCommentData={ true }
						isPostView={ true }
					/>
				) ) }
				{ ! showAllReplies &&
					replies.length > 5 && (
						<Notice
							icon="chevron-down"
							showDismiss={ false }
							text={ translate( 'Show %(remainingReplies)d more comments', {
								args: { remainingReplies: replies.length - 5 },
							} ) }
						>
							<NoticeAction onClick={ this.toggleShowAllReplies }>
								{ translate( 'Show' ) }
							</NoticeAction>
						</Notice>
					) }
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
