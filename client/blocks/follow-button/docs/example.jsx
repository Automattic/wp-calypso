/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import FollowButton from 'client/blocks/follow-button/button';
import Card from 'client/components/card/compact';

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
