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
import {
	CONVERSATION_FOLLOW_STATUS_FOLLOWING,
	CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING,
	CONVERSATION_FOLLOW_STATUS_MUTING,
} from 'state/reader/conversations/follow-status';

class ConversationFollowButtonContainer extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		onFollowToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),
		defaultConversationFollowStatus: PropTypes.oneOf( [
			CONVERSATION_FOLLOW_STATUS_FOLLOWING,
			CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING,
			CONVERSATION_FOLLOW_STATUS_MUTING,
		] ),
	};

	static defaultProps = {
		onFollowToggle: noop,
		defaultConversationFollowStatus: CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING,
	};

	handleFollowToggle = isRequestingFollow => {
		const { siteId, postId } = this.props;

		if ( isRequestingFollow ) {
			this.props.followConversation( { siteId, postId } );
		} else {
			this.props.muteConversation( { siteId, postId } );
		}

		this.props.onFollowToggle( isRequestingFollow );
	};

	render() {
		let followStatus;

		// If follow status is not 'F' or 'M', then use the defaultConversationFollowStatus as the status
		if ( this.props.defaultConversationFollowStatus && ! this.props.followStatus ) {
			followStatus = this.props.defaultConversationFollowStatus;
		} else {
			followStatus = this.props.followStatus;
		}

		const isFollowing = followStatus === CONVERSATION_FOLLOW_STATUS_FOLLOWING;

		return (
			<ConversationFollowButton
				isFollowing={ isFollowing }
				onFollowToggle={ this.handleFollowToggle }
				className={ this.props.className }
				tagName={ this.props.tagName }
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
