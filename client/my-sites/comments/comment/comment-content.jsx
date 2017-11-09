/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import CommentPostLink from 'my-sites/comments/comment/comment-post-link';
import { stripHTML, decodeEntities } from 'lib/formatting';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { getParentComment, getSiteComment } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class CommentContent extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		isExpanded: PropTypes.bool,
		isPostView: PropTypes.bool,
	};

	trackDeepReaderLinkClick = () =>
		this.props.isJetpack ? noop : this.props.recordReaderCommentOpened();

	renderInReplyTo = () => {
		const { commentUrl, isExpanded, parentCommentContent, translate } = this.props;

		if ( ! parentCommentContent ) {
			return null;
		}

		return (
			<div className="comment__in-reply-to">
				{ ! isExpanded && <Gridicon icon="reply" size={ 18 } /> }
				<span>{ translate( 'In reply to:' ) }</span>
				<a href={ commentUrl } onClick={ this.trackDeepReaderLinkClick }>
					<Emojify>{ parentCommentContent }</Emojify>
				</a>
			</div>
		);
	};

	render() {
		const {
			commentContent,
			commentId,
			commentIsPending,
			isExpanded,
			isPostView,
			translate,
		} = this.props;
		return (
			<div className="comment__content">
				{ ! isExpanded && (
					<div className="comment__content-preview">
						{ this.renderInReplyTo() }

						<AutoDirection>
							<Emojify>{ decodeEntities( stripHTML( commentContent ) ) }</Emojify>
						</AutoDirection>
					</div>
				) }

				{ isExpanded && (
					<div className="comment__content-full">
						{ ( commentIsPending || ! isPostView ) && (
							<div className="comment__content-info">
								{ ! isPostView && <CommentPostLink { ...{ commentId, isExpanded } } /> }

								{ commentIsPending && (
									<div className="comment__status-label">{ translate( 'Pending' ) }</div>
								) }
							</div>
						) }

						{ this.renderInReplyTo() }

						<AutoDirection>
							<Emojify>
								<div
									className="comment__content-body"
									dangerouslySetInnerHTML={ { __html: commentContent } } //eslint-disable-line react/no-danger
								/>
							</Emojify>
						</AutoDirection>
					</div>
				) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );

	const comment = getSiteComment( state, siteId, commentId );
	const postId = get( comment, 'post.ID' );

	const commentUrl = isJetpack
		? get( comment, 'URL' )
		: `/read/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }`;

	const parentComment = getParentComment( state, siteId, postId, commentId );
	const parentCommentContent = decodeEntities( stripHTML( get( parentComment, 'content' ) ) );

	return {
		commentContent: get( comment, 'content' ),
		commentIsPending: 'unapproved' === get( comment, 'status' ),
		commentUrl,
		isJetpack,
		parentCommentContent,
		postId,
	};
};

const mapDispatchToProps = dispatch => ( {
	recordReaderCommentOpened: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_comment_opened' ),
				bumpStat( 'calypso_comment_management', 'comment_opened' )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentContent ) );
