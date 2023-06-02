import { Component } from 'react';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';

import './style.scss';

export default class extends Component {
	static displayName = 'ConnectedApplicationIcon';

	render() {
		return <PluginIcon className="connected-application-icon" image={ this.props.image } />;
	}
}
