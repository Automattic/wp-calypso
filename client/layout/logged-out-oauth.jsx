/**
 * External dependencies
 */
import React from 'react';

module.exports = React.createClass( {
	displayName: 'LayoutLoggedOutAuth',

	render: function() {
		return (
			<div className="wp logged-out-auth">
				<div id="content" className="wp-content">
					<div id="primary" className="wp-primary wp-section">
					</div>
				</div>
			</div>
		);
	}
} );
