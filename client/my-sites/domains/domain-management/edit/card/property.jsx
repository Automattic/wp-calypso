/** @format */

/**
 * External dependencies
 */

import React from 'react';

class Property extends React.Component {
	render() {
		return (
			<div className="domain-details-card__property">
				<strong>{ this.props.label }:</strong>
				<span>{ this.props.children }</span>
			</div>
		);
	}
}

export default Property;
