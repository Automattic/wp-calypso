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
					<h3>Disabled</h3>
					<FollowMenu disabled={ true } />
				</Card>
				<Card compact>
					<h3>Compact</h3>
					<div>
						<FollowMenu compact />
					</div>
					<div style={ { marginTop: 1 + 'em' } }>
						<FollowMenu compact following={ true } />
					</div>
				</Card>
				<Card compact>
					<h3>With custom label</h3>
					<FollowMenu followLabel="Follow Tag" />
				</Card>
			</div>
		);
	}
}
