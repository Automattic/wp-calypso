/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	displayName: 'Sidebar',

	render: function() {
		return (
			<ul className="sidebar">
				{ this.props.children }
			</ul>
		);
	}
} );
