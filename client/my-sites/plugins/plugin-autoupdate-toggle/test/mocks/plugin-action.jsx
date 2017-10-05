/**
 * External dependencies
 */
import React from 'react';

module.exports = class extends React.Component {
    static displayName = 'MockPluginAction';

	render() {
		return <div className="plugin-action" onClick={ this.props.action }></div>;
	}
};
