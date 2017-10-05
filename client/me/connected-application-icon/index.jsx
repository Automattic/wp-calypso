/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';

module.exports = class extends React.Component {
    static displayName = 'ConnectedApplicationIcon';

	static defaultProps = {
		size: 40
	};

	render() {
		return (
			<PluginIcon
				className="connected-application-icon"
				image={ this.props.image }
				size={ this.props.size }
			/>
		);
	}
};
