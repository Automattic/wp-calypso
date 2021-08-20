/*
 */

import { CompactCard as Card } from '@automattic/components';
import React from 'react';
import ConversationFollowButton from 'calypso/blocks/conversation-follow-button/button';

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
