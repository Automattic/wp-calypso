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
import { stripHTML, decodeEntities } from 'lib/formatting';
import { getPostTitle } from 'my-sites/comments/comment/utils';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { getSiteComment } from 'state/selectors';
import { getPostCommentsTree } from 'state/comments/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export class CommentContent extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		isExpanded: PropTypes.bool,
	};

	trackDeepReaderLinkClick = () =>
		this.props.isJetpack ? noop : this.props.recordReaderCommentOpened();

	renderInReplyTo = () => {
		const { commentUrl, parentCommentContent, translate } = this.props;

		if ( ! parentCommentContent ) {
			return null;
		}

		return (
			<div className="comment__in-reply-to">
				<Gridicon icon="reply" size={ 18 } />
				<span>{ translate( 'In reply to:' ) }</span>
				<a href={ commentUrl } onClick={ this.trackDeepReaderLinkClick }>
					<Emojify>{ parentCommentContent }</Emojify>
				</a>
			</div>
		);
	};

	render() {
		const { commentContent, isExpanded, postId, postTitle, siteSlug } = this.props;
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
						<div className="comment__post">
							<a href={ `/comments/all/${ siteSlug }/${ postId }` }>{ postTitle }</a>
						</div>

						{ this.renderInReplyTo() }

						<AutoDirection>
							<Emojify>
								<div
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

	const commentsTree = getPostCommentsTree( state, siteId, postId, 'all' );
	const parentCommentId = get( commentsTree, [ commentId, 'data', 'parent', 'ID' ], 0 );
	const parentComment = get( commentsTree, [ parentCommentId, 'data' ], {} );
	const parentCommentContent = decodeEntities( stripHTML( get( parentComment, 'content' ) ) );

	return {
		commentContent: get( comment, 'content' ),
		commentUrl,
		isJetpack,
		parentCommentContent,
		postId,
		postTitle: getPostTitle( comment ),
		siteSlug: getSelectedSiteSlug( state ),
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
