/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

/***
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import { getPostCommentsTree } from 'state/comments/selectors';

export class ConversationCaterpillar extends React.Component {
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
			</div>
		);
	}
}

const ConnectedConversationCaterpillar = connect( ( state, ownProps ) => {
	return {
		commentsTree: getPostCommentsTree( state, ownProps.blogId, ownProps.postId, 'all' ),
	};
} )( ConversationCaterpillar );

export default ConnectedConversationCaterpillar;
