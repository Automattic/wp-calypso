import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import DOMPurify from 'dompurify';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AutoDirection from 'calypso/components/auto-direction';
import QueryComment from 'calypso/components/data/query-comment';
import { stripHTML, decodeEntities } from 'calypso/lib/formatting';
import CommentLink from 'calypso/my-sites/comments/comment/comment-link';
import CommentPostLink from 'calypso/my-sites/comments/comment/comment-post-link';
import { getParentComment, getSiteComment } from 'calypso/state/comments/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { hasBlocks } from './utils';

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
					{ parentCommentContent }
				</CommentLink>
			</div>
		);
	};

	render() {
		const {
			commentContent,
			commentRawContent,
			commentId,
			commentStatus,
			isBulkMode,
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

						<AutoDirection>{ decodeEntities( stripHTML( commentContent ) ) }</AutoDirection>
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
							<div
								className={ classnames( 'comment__content-body', {
									'with-blocks': hasBlocks( commentRawContent ),
								} ) }
								// eslint-disable-next-line react/no-danger
								dangerouslySetInnerHTML={ {
									__html: DOMPurify.sanitize( commentContent, {
										ALLOWED_TAGS: [
											'p',
											'figcaption',
											'iframe',
											'img',
											'span',
											'#text',
											'div',
											'figure',
											'a',
											'strong',
											'em',
											'br',
											'ul',
											'ol',
											'li',
											'blockquote',
											'pre',
											'cite',
											'code',
										],
										ALLOWED_ATTR: [
											'style',
											'class',
											'href',
											'src',
											'title',
											'target',
											'width',
											'height',
											'frameborder',
											'allow',
											'loading',
											'aria-controls',
											'aria-current',
											'aria-describedby',
											'aria-details',
											'aria-expanded',
											'aria-hidden',
											'aria-label',
											'aria-labelledby',
											'aria-live',
										],
									} ),
								} }
							/>
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

	const comment = getSiteComment( state, siteId, commentId );
	const postId = get( comment, 'post.ID' );

	const parentComment = getParentComment( state, siteId, postId, commentId );
	const parentCommentId = get( comment, 'parent.ID', 0 );
	const parentCommentContent = decodeEntities( stripHTML( get( parentComment, 'content' ) ) );

	const parentCommentUrl = `/comment/${ siteSlug }/${ parentCommentId }`;

	return {
		commentContent: get( comment, 'content' ),
		commentRawContent: get( comment, 'raw_content' ),
		commentStatus: get( comment, 'status' ),
		isParentCommentLoaded: ! parentCommentId || !! parentCommentContent,
		parentCommentContent,
		parentCommentId,
		parentCommentUrl,
		postId,
		siteId,
	};
};

export default connect( mapStateToProps )( localize( CommentContent ) );
