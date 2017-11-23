/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map, get, last, uniqBy, size, filter, takeRight, compact } from 'lodash';
import { localize } from 'i18n-calypso';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

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
	state = { animatingAuthors: [] };

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

		this.setState( { animatingAuthors: this.getAuthorsToDisplay() } );

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

	getAuthorsToDisplay = () => {
		const allExpandableComments = this.getExpandableComments();
		const expandableComments = takeRight( allExpandableComments, NUMBER_TO_EXPAND );

		const uniqueAuthors = uniqBy( map( expandableComments, 'author' ), 'ID' );
		const displayedAuthors = takeRight(
			filter( uniqueAuthors, 'avatar_URL' ),
			MAX_GRAVATARS_TO_DISPLAY
		);
		return displayedAuthors;
	};

	renderAuthors = authors => {
		const gravatarSmallScreenThreshold = MAX_GRAVATARS_TO_DISPLAY / 2;
		const authorsCount = size( authors );

		return map( authors, ( author, index ) => {
			let gravClasses = 'conversation-caterpillar__gravatar';
			// If we have more than 5 gravs,
			// add a additional class so we can hide some on small screens
			if (
				authorsCount > gravatarSmallScreenThreshold &&
				index < authorsCount - gravatarSmallScreenThreshold
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
		} );
	};

	render() {
		const { translate, parentCommentId, comments } = this.props;
		const allExpandableComments = this.getExpandableComments();
		const isRoot = ! parentCommentId;
		const numberUnfetchedComments = this.props.commentCount - size( comments );
		const commentCount = isRoot
			? numberUnfetchedComments + size( allExpandableComments )
			: size( allExpandableComments );

		const displayedAuthors = this.getAuthorsToDisplay();
		const lastAuthorName = get( last( displayedAuthors ), 'name' );
		console.error( displayedAuthors );

		return (
			<div className="conversation-caterpillar">
				<div className="conversation-caterpillar__gravatars" onClick={ this.handleTickle }>
					{ this.renderAuthors( this.displayedAuthors ) }
				</div>
				<ReactCSSTransitionGroup
					transitionName="slideDownFadeIn"
					transitionEnterTimeout={ 150 }
					transitionLeaveTimeout={ 150 }
				>
					<div className="conversation-caterpillar__gravatars is-animating">
						{ this.renderAuthors( this.state.animatingAuthors ) }
					</div>
				</ReactCSSTransitionGroup>
				<button
					className="conversation-caterpillar__count"
					onClick={ this.handleTickle }
					title={
						commentCount > 1
							? translate( 'View comments from %(commenterName)s and %(count)d more', {
									args: {
										commenterName: lastAuthorName,
										count: commentCount - 1,
									},
								} )
							: translate( 'View comment from %(commenterName)s', {
									args: {
										commenterName: lastAuthorName,
									},
								} )
					}
				>
					{ commentCount > 1
						? translate( '%(commenterName)s and %(count)d more', {
								args: {
									commenterName: lastAuthorName,
									count: commentCount - 1,
								},
							} )
						: translate( '%(commenterName)s commented', {
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
