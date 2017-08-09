/** @format */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map, get, last, uniqBy, size, filter, takeRight } from 'lodash';
import { localize } from 'i18n-calypso';

/***
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import { getDateSortedPostComments } from 'state/comments/selectors';
import Card from 'components/card';

const MAX_GRAVATARS_TO_DISPLAY = 10;

class ConversationCaterpillarComponent extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		comments: PropTypes.array.isRequired,
	};

	render() {
		const { comments, translate } = this.props;
		const commentCount = size( comments );

		// Only display authors with a gravatar, and only display each author once
		const uniqueAuthors = uniqBy( map( comments, 'author' ), 'ID' );
		const displayedAuthors = takeRight(
			filter( uniqueAuthors, 'has_avatar' ),
			MAX_GRAVATARS_TO_DISPLAY
		);
		const displayedAuthorsCount = size( displayedAuthors );
		const lastAuthorName = get( last( displayedAuthors ), 'name' );
		const gravatarSmallScreenThreshold = MAX_GRAVATARS_TO_DISPLAY / 2;

		// At the moment, we just show authors for the entire comments array
		return (
			<Card className="conversation-caterpillar">
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

const ConnectedConversationCaterpillar = connect( ( state, ownProps ) => {
	return {
		comments: getDateSortedPostComments( state, ownProps.blogId, ownProps.postId ),
	};
} )( ConversationCaterpillar );

export default ConnectedConversationCaterpillar;
