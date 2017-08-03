/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	render() {
		return <div className="plugin-action" onClick={ this.props.action }></div>;
	}
} );
