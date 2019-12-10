/*
 */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ConversationFollowButton from 'blocks/conversation-follow-button/button';
import Card from '@automattic/components/card/compact';

export default class ConversationFollowButtonExample extends React.PureComponent {
	static displayName = 'ConversationFollowButton';

	render() {
		return (
			<div>
				<Card compact>
					<ConversationFollowButton isFollowing={ false } />
				</Card>
				<Card compact>
					<ConversationFollowButton isFollowing={ true } />
				</Card>
			</div>
		);
	}
}
