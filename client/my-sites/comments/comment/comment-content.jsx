/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import AutoDirection from 'calypso/components/auto-direction';
import CommentLink from 'calypso/my-sites/comments/comment/comment-link';
import CommentPostLink from 'calypso/my-sites/comments/comment/comment-post-link';
import Emojify from 'calypso/components/emojify';
import QueryComment from 'calypso/components/data/query-comment';
import { stripHTML, decodeEntities } from 'calypso/lib/formatting';
import { getParentComment, getSiteComment } from 'calypso/state/comments/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export class CommentContent extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		isBulkMode: PropTypes.bool,
		isPostView: PropTypes.bool,
	};

	renderInReplyTo = () => {
		const { commentId, isBulkMode, parentCommentContent, parentCommentUrl, translate } = this.props;

		if ( ! parentCommentContent ) {
			return null;
		}

		return (
			<div className="comment__in-reply-to">
				{ isBulkMode && <Gridicon icon="reply" size={ 18 } /> }
				<span>{ translate( 'In reply to:' ) }</span>
				<CommentLink
					commentId={ commentId }
					href={ parentCommentUrl }
					tabIndex={ isBulkMode ? -1 : 0 }
				>
					<Emojify>{ parentCommentContent }</Emojify>
				</CommentLink>
			</div>
		);
	};

	render() {
		const {
			commentContent,
			commentId,
			commentStatus,
			isBulkMode,
			isCommentSaved,
			isParentCommentLoaded,
			isPostView,
			parentCommentContent,
			parentCommentId,
			siteId,
			translate,
		} = this.props;
		return (
			<div className="comment__content">
				{ ! isParentCommentLoaded && (
					<QueryComment commentId={ parentCommentId } siteId={ siteId } forceWpcom />
				) }

				{ isBulkMode && (
					<div className="comment__content-preview">
						{ this.renderInReplyTo() }

						<AutoDirection>
							<Emojify>{ decodeEntities( stripHTML( commentContent ) ) }</Emojify>
						</AutoDirection>
					</div>
				) }

				{ ! isBulkMode && (
					<div className="comment__content-full">
						{ ( parentCommentContent || ! isPostView || 'approved' !== commentStatus ) && (
							<div className="comment__content-info">
								{ 'unapproved' === commentStatus && (
									<div className="comment__status-label is-pending">{ translate( 'Pending' ) }</div>
								) }
								{ 'spam' === commentStatus && (
									<div className="comment__status-label is-spam">{ translate( 'Spam' ) }</div>
								) }
								{ 'trash' === commentStatus && (
									<div className="comment__status-label is-trash">{ translate( 'Trash' ) }</div>
								) }

								{ ! isPostView && <CommentPostLink { ...{ commentId, isBulkMode } } /> }

								{ this.renderInReplyTo() }
							</div>
						) }

						<AutoDirection>
							<Emojify>
								{ /* Don't trust comment content unless it was provided by the API */ }
								{ isCommentSaved ? (
									<div
										className="comment__content-body"
										dangerouslySetInnerHTML={ { __html: commentContent } } //eslint-disable-line react/no-danger
									/>
								) : (
									<div className="comment__content-body">
										{ commentContent &&
											commentContent.split( '\n' ).map( ( item, key ) => {
												return (
													<span key={ key }>
														{ item }
														<br />
													</span>
												);
											} ) }
									</div>
								) }
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
	const siteSlug = getSelectedSiteSlug( state );
	const isJetpack = isJetpackSite( state, siteId );

	const comment = getSiteComment( state, siteId, commentId );
	const postId = get( comment, 'post.ID' );

	const parentComment = getParentComment( state, siteId, postId, commentId );
	const parentCommentId = get( comment, 'parent.ID', 0 );
	const parentCommentContent = decodeEntities( stripHTML( get( parentComment, 'content' ) ) );

	const parentCommentUrl = isJetpack
		? get( parentComment, 'URL' )
		: `/comment/${ siteSlug }/${ parentCommentId }`;

	return {
		commentContent: get( comment, 'content' ),
		commentStatus: get( comment, 'status' ),
		isCommentSaved: get( comment, 'isSaved' ),
		isJetpack,
		isParentCommentLoaded: ! parentCommentId || !! parentCommentContent,
		parentCommentContent,
		parentCommentId,
		parentCommentUrl,
		postId,
		siteId,
	};
};

export default connect( mapStateToProps )( localize( CommentContent ) );
