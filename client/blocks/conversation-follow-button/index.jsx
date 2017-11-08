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
	CONVERSATION_FOLLOW_STATUS_MUTING,
} from 'state/reader/conversations/follow-status';

class ConversationFollowButtonContainer extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		onFollowToggle: PropTypes.func,
		tagName: PropTypes.oneOfType( [ PropTypes.string, PropTypes.func ] ),

		/* This is a special prop for the Conversations stream, where we have a mixture
		 * of explicitly followed posts (followStatus F) and implicitly followed posts
		 * (followStatus null). We want to present them all as followed.
		 */
		showFollowingForAllUnmutedConversations: PropTypes.bool,
	};

	static defaultProps = {
		onFollowToggle: noop,
		showFollowingForAllUnmutedConversations: false,
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
		let isFollowing = false;
		if ( this.props.showFollowingForAllUnmutedConversations ) {
			isFollowing = this.props.followStatus !== CONVERSATION_FOLLOW_STATUS_MUTING;
		} else {
			isFollowing = this.props.followStatus === CONVERSATION_FOLLOW_STATUS_FOLLOWING;
		}

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
