/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExternalLink from 'components/external-link';

export default React.createClass( {
	displayName: 'ExternalLink',

	render() {
		return (
			<Card>
				<p><ExternalLink icon={ true } href="https://wordpress.org" >WordPress.org</ExternalLink></p>
				<p><ExternalLink showIconFirst={ true } icon={ true } href="https://wordpress.org" >WordPress.org</ExternalLink></p>
				<p><ExternalLink href="https://wordpress.org">WordPress.org</ExternalLink></p>
			</Card>
		);
	}
} );
