/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';

export default class extends React.PureComponent {
	static displayName = 'DevWelcome';

	render() {
		return (
			<Card className="devdocs__welcome">
				<h1 className="devdocs__welcome-title">Welcome to WP Calypso!</h1>
				<img
					className="devdocs__welcome-illustration"
					src="/calypso/images/illustrations/illustration-nosites.svg"
				/>
				<p>
					This is your local running copy of Calypso. If you want a quick start,{ ' ' }
					<a href="/devdocs/docs/guide/index.md">check the Guide</a>. To access the documentation at
					any time, use the small badge in the bottom right corner.
				</p>
			</Card>
		);
	}
}
