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
import {
	getPostCommentsTree,
	getDateSortedPostComments,
	getHiddenCommentsForPost,
} from 'state/comments/selectors';
import { expandComments } from 'state/comments/actions';
import { POST_COMMENT_DISPLAY_TYPES } from 'state/comments/constants';
import Card from 'components/card';
import { isAncestor } from 'blocks/comments/utils';

const MAX_GRAVATARS_TO_DISPLAY = 10;
const NUMBER_TO_EXPAND = 10;

class ConversationCaterpillarComponent extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		commentsTree: PropTypes.object.isRequired,
		comments: PropTypes.array.isRequired,
		parentCommentId: PropTypes.number,
	};

	getExpandableComments = () => {
		const { comments, hiddenComments, parentCommentId, commentsTree } = this.props;
		const isRoot = ! parentCommentId;
		const parentComment = get( commentsTree, [ parentCommentId, 'data' ] );

		const childComments = isRoot
			? comments
			: filter( comments, child => isAncestor( parentComment, child, commentsTree ) );

		const commentsToExpand = filter( childComments, comment => hiddenComments[ comment.ID ] );

		return commentsToExpand;
	};

	handleTickle = () => {
		const { blogId, postId } = this.props;
		const commentsToExpand = takeRight( this.getExpandableComments(), NUMBER_TO_EXPAND );

		this.props.expandComments( {
			siteId: blogId,
			postId,
			commentIds: map( commentsToExpand, 'ID' ),
			displayType: POST_COMMENT_DISPLAY_TYPES.excerpt,
		} );
		this.props.expandComments( {
			siteId: blogId,
			postId,
			commentIds: compact( map( commentsToExpand, c => get( c, 'parent.ID', null ) ) ),
			displayType: POST_COMMENT_DISPLAY_TYPES.singleLine,
		} );
	};

	render() {
		const { translate } = this.props;
		const allExpandableComments = this.getExpandableComments();
		const expandableComments = takeRight( allExpandableComments, NUMBER_TO_EXPAND );
		const commentCount = size( allExpandableComments );

		// Only display authors with a gravatar, and only display each author once
		const uniqueAuthors = uniqBy( map( expandableComments, 'author' ), 'ID' );
		const displayedAuthors = takeRight(
			filter( uniqueAuthors, 'avatar_URL' ),
			MAX_GRAVATARS_TO_DISPLAY
		);
		const displayedAuthorsCount = size( displayedAuthors );
		const lastAuthorName = get( last( displayedAuthors ), 'name' );
		const gravatarSmallScreenThreshold = MAX_GRAVATARS_TO_DISPLAY / 2;

		return (
			<Card className="conversation-caterpillar" onClick={ this.handleTickle }>
				<div className="conversation-caterpillar__gravatars">
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
			</Card>
		);
	}
}

export const ConversationCaterpillar = localize( ConversationCaterpillarComponent );

const ConnectedConversationCaterpillar = connect(
	( state, ownProps ) => {
		const { blogId, postId } = ownProps;
		return {
			comments: getDateSortedPostComments( state, blogId, postId ),
			hiddenComments: getHiddenCommentsForPost( state, blogId, postId ),
			commentsTree: getPostCommentsTree( state, blogId, postId, 'all' ),
		};
	},
	{ expandComments }
)( ConversationCaterpillar );

export default ConnectedConversationCaterpillar;
