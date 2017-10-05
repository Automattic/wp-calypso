/**
 * External dependencies
 */
import React from 'react';

module.exports = React.createClass( {
	displayName: 'MockPluginAction',

	render: function() {
		return <div className="plugin-action" onClick={ this.props.action }></div>;
	}
} );
