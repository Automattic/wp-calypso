/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/***
 * Internal dependencies
 */
import { getPostCommentsTree } from 'state/comments/selectors';

export class ConversationCaterpillar extends React.Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		commentId: PropTypes.number.isRequired,
	};

	render() {
		const { commentId /*, commentsTree*/ } = this.props;
		if ( ! commentId ) {
			return null;
		}

		return <div className="conversation-caterpillar">🐛</div>;
	}
}

const ConnectedConversationCaterpillar = connect( ( state, ownProps ) => {
	return {
		commentsTree: getPostCommentsTree( state, ownProps.siteId, ownProps.postId, 'all' ),
	};
} )( ConversationCaterpillar );

export default ConnectedConversationCaterpillar;
