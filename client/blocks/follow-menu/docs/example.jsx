/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FollowMenu from 'blocks/follow-menu/button';
import Card from 'components/card/compact';

export default class FollowMenuExample extends React.PureComponent {
	static displayName = 'FollowMenuExample';

	render() {
		return (
			<div>
				<Card compact>
					<FollowMenu following={ false } />
				</Card>
				<Card compact>
					<FollowMenu following={ true } />
				</Card>
				<Card compact>
					<FollowMenu disabled={ true } />
				</Card>
				<Card compact>
					<h3>With custom label</h3>
					<FollowMenu followLabel="Follow Tag" />
				</Card>
			</div>
		);
	}
}
