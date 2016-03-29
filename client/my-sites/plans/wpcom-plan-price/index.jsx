/**
 * External dependencies
 */
import React from 'react';

const WpcomPlanPrice = React.createClass( {
	render() {
		return (
			<div className={ this.props.hasDiscount ? "wpcom-plan-price wpcom-plan-price__discount" : "wpcom-plan-price" }>
				<span>{ this.props.getPrice() }</span>
				<small className="wpcom-plan-price__billing-period">
					{ this.props.periodLabel }
				</small>
			</div>
		);
	}
} );

export default WpcomPlanPrice;
