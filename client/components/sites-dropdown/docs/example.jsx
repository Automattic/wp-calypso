/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SitesDropdown from 'components/sites-dropdown';

export default React.createClass( {

	displayName: 'SitesDropdownExample',

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/sites-dropdown">SitesDropdown</a>
				</h2>
				<SitesDropdown />
			</div>
		);
	}
} );
