/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import Card from 'components/card';

export default React.createClass( {

	displayName: 'ExternalLink',

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/external-link">External Link</a>
				</h2>
				<Card>
					<p><ExternalLink icon={ true } href="https://wordpress.org" >WordPress.org</ExternalLink></p>
					<p><ExternalLink href="https://wordpress.org">WordPress.org</ExternalLink></p>
				</Card>

			</div>
		);
	}
} );
