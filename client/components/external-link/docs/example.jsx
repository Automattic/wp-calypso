/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import Card from 'components/card';
import DocsExample from 'components/docs-example';

export default React.createClass( {

	displayName: 'ExternalLink',

	render() {
		return (
			<DocsExample
				title="External Link"
				url="/devdocs/design/external-link"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<Card>
					<p><ExternalLink icon={ true } href="https://wordpress.org" >WordPress.org</ExternalLink></p>
					<p><ExternalLink href="https://wordpress.org">WordPress.org</ExternalLink></p>
				</Card>
			</DocsExample>
		);
	}
} );
