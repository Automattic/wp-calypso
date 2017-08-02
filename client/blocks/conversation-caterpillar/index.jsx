/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map, get, last } from 'lodash';
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
		const lastComment = last( comments );
		const lastCommenterName = get( lastComment, 'author.name' );
		const commentCount = comments.length;

		// At the moment, we just show authors for the entire comments array
		return (
			<div className="conversation-caterpillar">
				{ map( comments, comment => {
					return (
						<Gravatar
							className="conversation-caterpillar__gravatar"
							key={ comment.ID }
							user={ comment.author }
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
										commenterName: lastCommenterName,
										count: commentCount - 1,
									},
								} )
							: translate( 'View comment from %(commenterName)s', {
									args: {
										commenterName: lastCommenterName,
									},
								} )
					}
				>
					{ commentCount > 1
						? translate( '%(commenterName)s and %(count)d more', {
								args: {
									commenterName: lastCommenterName,
									count: commentCount - 1,
								},
							} )
						: translate( '%(commenterName)s commented', {
								args: {
									commenterName: lastCommenterName,
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
