/**
 * @format
 */

/*
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ConversationFollowButton from './button';
import { getReaderConversationFollowStatus } from 'state/selectors';
import { followConversation, muteConversation } from 'state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS_FOLLOWING } from './follow-status';

class ConversationFollowButtonContainer extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		onFollowToggle: PropTypes.func,
		followLabel: PropTypes.string,
		followingLabel: PropTypes.string,
	};

	static defaultProps = {
		onFollowToggle: noop,
	};

	handleFollowToggle = following => {
		const { siteId, postId, followStatus } = this.props;

		if ( followStatus === CONVERSATION_FOLLOW_STATUS_FOLLOWING ) {
			this.props.muteConversation( { siteId, postId } );
		} else {
			this.props.followConversation( { siteId, postId } );
		}

		this.props.onFollowToggle( following );
	};

	render() {
		// Maybe change selector to do this?
		const following = this.props.followStatus === CONVERSATION_FOLLOW_STATUS_FOLLOWING;
		return (
			<ConversationFollowButton
				following={ following }
				onFollowToggle={ this.handleFollowToggle }
				followLabel={ this.props.followLabel }
				followingLabel={ this.props.followingLabel }
				className={ this.props.className }
			/>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		followStatus: getReaderConversationFollowStatus( state, {
			siteId: ownProps.siteId,
			postId: ownProps.postId,
		} ),
	} ),
	{
		followConversation,
		muteConversation,
	}
)( ConversationFollowButtonContainer );
