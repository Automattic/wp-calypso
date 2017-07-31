/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map, get } from 'lodash';
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
		commentId: PropTypes.number.isRequired,
	};

	render() {
		const { commentId, commentsTree } = this.props;
		if ( ! commentId ) {
			return null;
		}

		const firstComment = commentsTree[ Object.keys( commentsTree )[ 0 ] ];
		const firstCommenterName = get( firstComment, 'data.author.name' );

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
						/>
					);
				} ) }
				<div className="conversation-caterpillar__count">
					{ firstCommenterName }
				</div>
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
