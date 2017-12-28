/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PluginIcon from 'client/my-sites/plugins/plugin-icon/plugin-icon';

export default class extends React.Component {
	static displayName = 'ConnectedApplicationIcon';

	static defaultProps = {
		size: 40,
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
}
