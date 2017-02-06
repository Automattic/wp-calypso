/**
 * External dependencies
 */
import React from 'react';

const VerticalNav = React.createClass( {
	render() {
		return (
			<div className="vertical-nav">
				{ this.props.children }
			</div>
		);
	}
} );

export default VerticalNav;
