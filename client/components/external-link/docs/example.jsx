/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DocsExample from 'components/docs-example';
import ExternalLink from 'components/external-link';

export default React.createClass( {

	displayName: 'ExternalLink',

	render() {
		return (
			<DocsExample
				title="External Link"
				url="/devdocs/design/external-link"
				componentUsageStats={ this.props.getUsageStats( ExternalLink ) }
			>
				<Card>
					<p><ExternalLink icon={ true } href="https://wordpress.org" >WordPress.org</ExternalLink></p>
					<p><ExternalLink href="https://wordpress.org">WordPress.org</ExternalLink></p>
				</Card>
			</DocsExample>
		);
	}
} );
