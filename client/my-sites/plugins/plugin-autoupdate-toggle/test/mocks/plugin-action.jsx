/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

export default React.createClass( {
	displayName: 'MockPluginAction',

	render: function() {
		return <div className="plugin-action" onClick={ this.props.action } />;
	},
} );
