/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { isBusiness, isPremium } from 'lib/products-values';

const PlanDiscountMessage = React.createClass( {
	showMostPopularMessage() {
		return (
			this.props.showMostPopularMessage &&
			isPremium( this.props.plan ) &&
			this.props.plan.product_id !== ( this.props.site && this.props.site.plan.product_id )
		);
	},

	mostPopularPlan() {
		const hasBusiness = this.props.site && isBusiness( this.props.site.plan );

		return (
			hasBusiness ? null : <div className="plan-discount-message">{ this.translate( 'Our most popular plan' ) }</div>
		);
	},

	planHasDiscount() {
		return this.props.sitePlan && this.props.sitePlan.rawDiscount > 0;
	},

	planDiscountMessage() {
		const message = this.translate( 'Get %(discount)s off your first year', {
			args: { discount: this.props.sitePlan.formattedDiscount }
		} );

		return (
			<span className="plan-discount-message">{ message }</span>
		);
	},

	render() {
		if ( this.showMostPopularMessage() ) {
			return this.mostPopularPlan();
		}
		return false;
	}
} );

export default PlanDiscountMessage;
