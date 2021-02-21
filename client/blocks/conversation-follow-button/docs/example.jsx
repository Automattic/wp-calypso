/*
 */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ConversationFollowButton from 'calypso/blocks/conversation-follow-button/button';
import { CompactCard as Card } from '@automattic/components';

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
