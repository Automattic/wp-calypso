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
import { getPostCommentsTree } from 'state/comments/selectors';

class ConversationCaterpillarComponent extends React.Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		commentsTree: PropTypes.object.isRequired,
	};

	render() {
		const { commentsTree, translate } = this.props;
		const lastComment = commentsTree[ last( Object.keys( commentsTree ) ) ];
		const lastCommenterName = get( lastComment, 'data.author.name' );
		const commentCount = Object.keys( commentsTree ).length;

		// At the moment, we just show authors for the entire commentsTree
		return (
			<div className="conversation-caterpillar">
				{ map( commentsTree, comment => {
					return (
						<Gravatar
							className="conversation-caterpillar__gravatar"
							key={ comment.data.ID }
							user={ comment.data.author }
							size={ 32 }
							aria-hidden="true"
						/>
					);
				} ) }
				<button
					className="conversation-caterpillar__count"
					title={
						commentCount > 1
							? translate( 'View comments from %(commenterName)s and %(count)d others', {
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
						? translate( '%(commenterName)s and %(count)d others', {
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
		commentsTree: getPostCommentsTree( state, ownProps.blogId, ownProps.postId, 'all' ),
	};
} )( ConversationCaterpillar );

export default ConnectedConversationCaterpillar;
