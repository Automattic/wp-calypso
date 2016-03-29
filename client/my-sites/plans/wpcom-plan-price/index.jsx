/**
 * External dependencies
 */
import React from 'react';

const WpcomPlanPrice = React.createClass( {
	propTypes: {
		getPrice: React.PropTypes.func.isRequired,
		hasDiscount: React.PropTypes.bool,
		periodLabel: React.PropTypes.string.isRequired
	},

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
