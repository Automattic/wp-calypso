/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map, get, last, uniqBy, size, filter, takeRight, compact } from 'lodash';
import { localize } from 'i18n-calypso';

/***
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { getPostCommentsTree, getDateSortedPostComments } from 'state/comments/selectors';
import { expandComments } from 'state/comments/actions';
import { POST_COMMENT_DISPLAY_TYPES } from 'state/comments/constants';
import { isAncestor } from 'blocks/comments/utils';

const MAX_GRAVATARS_TO_DISPLAY = 10;
const NUMBER_TO_EXPAND = 10;

class ConversationCaterpillarComponent extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		commentsTree: PropTypes.object.isRequired,
		comments: PropTypes.array.isRequired,
		commentsToShow: PropTypes.object,
		parentCommentId: PropTypes.number,
	};

	getExpandableComments = () => {
		const { comments, commentsToShow, parentCommentId, commentsTree } = this.props;
		const isRoot = ! parentCommentId;
		const parentComment = get( commentsTree, [ parentCommentId, 'data' ] );

		const childComments = isRoot
			? comments
			: filter( comments, child => isAncestor( parentComment, child, commentsTree ) );

		const commentsToExpand = filter( childComments, comment => ! commentsToShow[ comment.ID ] );

		return commentsToExpand;
	};

	handleTickle = () => {
		const { blogId, postId } = this.props;
		const commentsToExpand = takeRight( this.getExpandableComments(), NUMBER_TO_EXPAND );

		// expand all N comments to excerpt
		this.props.expandComments( {
			siteId: blogId,
			postId,
			commentIds: map( commentsToExpand, 'ID' ),
			displayType: POST_COMMENT_DISPLAY_TYPES.excerpt,
		} );
		// for each of those comments, expand the comment's parent to singleLine
		this.props.expandComments( {
			siteId: blogId,
			postId,
			commentIds: compact( map( commentsToExpand, c => get( c, 'parent.ID', null ) ) ),
			displayType: POST_COMMENT_DISPLAY_TYPES.excerpt,
		} );
		recordAction( 'comment_caterpillar_click' );
		recordGaEvent( 'Clicked Caterpillar' );
		recordTrack( 'calypso_reader_comment_caterpillar_click', {
			blog_id: blogId,
			post_id: postId,
		} );
	};

	render() {
		const { translate, parentCommentId, comments } = this.props;
		const allExpandableComments = this.getExpandableComments();
		const expandableComments = takeRight( allExpandableComments, NUMBER_TO_EXPAND );
		const isRoot = ! parentCommentId;
		const numberUnfetchedComments = this.props.commentCount - size( comments );
		const commentCount = isRoot
			? numberUnfetchedComments + size( allExpandableComments )
			: size( allExpandableComments );

		// Only display authors with a gravatar, and only display each author once
		const uniqueAuthors = uniqBy( map( expandableComments, 'author' ), 'ID' );
		const displayedAuthors = takeRight(
			filter( uniqueAuthors, 'avatar_URL' ),
			MAX_GRAVATARS_TO_DISPLAY
		);
		const uniqueAuthorsCount = size( uniqueAuthors );
		const displayedAuthorsCount = size( displayedAuthors );
		const lastAuthorName = get( last( displayedAuthors ), 'name' );
		const gravatarSmallScreenThreshold = MAX_GRAVATARS_TO_DISPLAY / 2;

		return (
			<div className="conversation-caterpillar">
				<div className="conversation-caterpillar__gravatars" onClick={ this.handleTickle }>
					{ map( displayedAuthors, ( author, index ) => {
						let gravClasses = 'conversation-caterpillar__gravatar';
						// If we have more than 5 gravs,
						// add a additional class so we can hide some on small screens
						if (
							displayedAuthorsCount > gravatarSmallScreenThreshold &&
							index < displayedAuthorsCount - gravatarSmallScreenThreshold
						) {
							gravClasses += ' is-hidden-on-small-screens';
						}

						return (
							<Gravatar
								className={ gravClasses }
								key={ author.ID }
								user={ author }
								size={ 32 }
								aria-hidden="true"
							/>
						);
					} ) }
				</div>
				<button
					className="conversation-caterpillar__count"
					onClick={ this.handleTickle }
					title={ translate(
						'View %(count)s comment for this post',
						'View %(count)s comments for this post',
						{
							count: +commentCount,
							args: {
								count: commentCount,
							},
						}
					) }
				>
					{ commentCount > 1 &&
						uniqueAuthorsCount > 1 &&
						translate( '%(count)d comments from %(commenterName)s and others', {
							args: {
								commenterName: lastAuthorName,
								count: commentCount,
							},
						} ) }
					{ commentCount > 1 &&
						uniqueAuthorsCount === 1 &&
						translate( '%(count)d comments from %(commenterName)s', {
							args: {
								commenterName: lastAuthorName,
								count: commentCount,
							},
						} ) }
					{ commentCount === 1 &&
						translate( '1 comment from %(commenterName)s', {
							args: {
								commenterName: lastAuthorName,
							},
						} ) }
				</button>
			</div>
		);
	}
}

export const ConversationCaterpillar = localize( ConversationCaterpillarComponent );

const ConnectedConversationCaterpillar = connect(
	( state, ownProps ) => {
		const { blogId, postId } = ownProps;
		return {
			comments: getDateSortedPostComments( state, blogId, postId ),
			commentsTree: getPostCommentsTree( state, blogId, postId, 'all' ),
		};
	},
	{ expandComments }
)( ConversationCaterpillar );

export default ConnectedConversationCaterpillar;
