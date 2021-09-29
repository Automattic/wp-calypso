import { Component } from 'react';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';

import './style.scss';

export default class extends Component {
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
