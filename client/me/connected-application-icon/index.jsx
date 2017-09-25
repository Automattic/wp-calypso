/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';

module.exports = React.createClass( {

	displayName: 'ConnectedApplicationIcon',

	getDefaultProps: function() {
		return {
			size: 40
		};
	},

	render: function() {
		return (
			<PluginIcon
				className="connected-application-icon"
				image={ this.props.image }
				size={ this.props.size }
			/>
		);
	}
} );
