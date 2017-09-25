/**
 * External dependencies
 */
import React from 'react';

const Property = React.createClass( {
	render() {
		return (
			<div className="domain-details-card__property">
				<strong>
					{ this.props.label }:
				</strong>
				<span>
					{ this.props.children }
				</span>
			</div>
		);
	}
} );

module.exports = Property;
