import { CompactCard as Card } from '@automattic/components';
import React from 'react';
import FollowButton from 'calypso/blocks/follow-button/button';

export default class FollowButtonExample extends React.PureComponent {
	static displayName = 'FollowButtonExample';

	render() {
		return (
			<div>
				<Card compact>
					<FollowButton following={ false } />
				</Card>
				<Card compact>
					<FollowButton following={ true } />
				</Card>
				<Card compact>
					<FollowButton disabled={ true } />
				</Card>
				<Card compact>
					<h3>With custom label</h3>
					<FollowButton followLabel="Follow Tag" />
				</Card>
			</div>
		);
	}
}
