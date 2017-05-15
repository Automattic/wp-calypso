/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

export default React.createClass( {
	displayName: 'ExternalLink',

	render() {
		return (
			<div>
				<p><ExternalLink icon={ true } href="https://wordpress.org" >WordPress.org</ExternalLink></p>
				<p><ExternalLink href="https://wordpress.org">WordPress.org</ExternalLink></p>
			</div>
		);
	}
} );
