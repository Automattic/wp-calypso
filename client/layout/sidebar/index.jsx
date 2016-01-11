/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	displayName: 'Sidebar',

	propTypes: {
		className: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	render: function() {
		return (
			<ul className="sidebar" onClick={ this.props.onClick }>
				{ this.props.children }
			</ul>
		);
	}
} );
