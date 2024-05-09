import { CompactCard as Card } from '@automattic/components';
import { PureComponent } from 'react';
import FollowButton from 'calypso/blocks/follow-button/button';

export default class FollowButtonExample extends PureComponent {
	static displayName = 'FollowButtonExample';

	render() {
		return (
			<div>
				<Card compact>
					<FollowButton following={ false } />
				</Card>
				<Card compact>
					<FollowButton following />
				</Card>
				<Card compact>
					<FollowButton disabled />
				</Card>
				<Card compact>
					<h3>With custom label</h3>
					<FollowButton followLabel="Follow Tag" />
				</Card>
			</div>
		);
	}
}
