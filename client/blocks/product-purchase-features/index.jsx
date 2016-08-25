/**
 * External dependencies
 */
import React, { Component } from 'react';

export default class PlanPurchaseFeatures extends Component {
	render() {
		return (
			<div className="product-purchase-features">
				{ this.props.children }
			</div>
		);
	}
}
