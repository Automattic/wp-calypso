import { Component } from 'react';

export default class extends Component {
	static displayName = 'MockPluginAction';

	render() {
		return <div className="plugin-action" onClick={ this.props.action } />;
	}
}
