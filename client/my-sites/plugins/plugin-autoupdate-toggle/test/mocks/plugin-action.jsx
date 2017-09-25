/**
 * External dependencies
 */
import React from 'react';

export default React.createClass( {
	render: function() {
		return <div className="plugin-action" onClick={ this.props.action }></div>;
	}
} );
