/** @format */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map, get, last, uniqBy, size, filter } from 'lodash';
import { localize } from 'i18n-calypso';

/***
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import { getDateSortedPostComments } from 'state/comments/selectors';

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
		const displayedAuthors = filter( uniqueAuthors, author => !! author.avatar_URL );
		const displayedAuthorsCount = size( displayedAuthors );
		const lastAuthorName = get( last( displayedAuthors ), 'name' );

		// At the moment, we just show authors for the entire comments array
		return (
			<div className="conversation-caterpillar">
				{ map( displayedAuthors, author => {
					return (
						<Gravatar
							className="conversation-caterpillar__gravatar"
							key={ author.ID }
							user={ author }
							size={ 32 }
							aria-hidden="true"
						/>
					);
				} ) }
				<button
					className="conversation-caterpillar__count"
					title={
						commentCount > 1
							? translate( 'View comments from %(commenterName)s and %(count)d more', {
									args: {
										commenterName: lastAuthorName,
										count: displayedAuthorsCount - 1,
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
									count: displayedAuthorsCount - 1,
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

const ConnectedConversationCaterpillar = connect( ( state, ownProps ) => {
	return {
		comments: getDateSortedPostComments( state, ownProps.blogId, ownProps.postId ),
	};
} )( ConversationCaterpillar );

export default ConnectedConversationCaterpillar;
