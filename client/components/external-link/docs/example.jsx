/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'client/components/external-link';
import Card from 'client/components/card';

export default class extends React.Component {
	static displayName = 'ExternalLink';

	render() {
		return (
			<Card>
				<p>
					<ExternalLink icon={ true } href="https://wordpress.org">
						WordPress.org
					</ExternalLink>
				</p>
				<p>
					<ExternalLink showIconFirst={ true } icon={ true } href="https://wordpress.org">
						WordPress.org
					</ExternalLink>
				</p>
				<p>
					<ExternalLink href="https://wordpress.org">WordPress.org</ExternalLink>
				</p>
			</Card>
		);
	}
}
