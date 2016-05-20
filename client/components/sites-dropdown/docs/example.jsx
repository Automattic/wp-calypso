/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import SitesDropdown from 'components/sites-dropdown';

export default React.createClass( {

	displayName: 'SitesDropdown',

	render: function() {
		return (
			<DocsExample
				title="SitesDropdown"
				url="/devdocs/design/sites-dropdow"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<SitesDropdown />
			</DocsExample>
		);
	}
} );
