import { CompactCard as Card } from '@automattic/components';
import FollowButton from 'calypso/blocks/follow-button/button';

export default function FollowButtonExample(): JSX.Element {
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

FollowButtonExample.displayName = 'FollowButtonExample';
