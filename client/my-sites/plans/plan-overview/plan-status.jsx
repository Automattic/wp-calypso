/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const PlanStatus = React.createClass( {
	propTypes: {
		plan: React.PropTypes.object.isRequired
	},

	render() {
		return (
			<Card>
				<span className="plan-status__text">
					{ this.translate( 'Your Current Plan:' ) }
				</span>
				<h1 className="plan-status__plan">
					{
						this.translate( '%(productName)s Free Trial', {
							args: { productName: this.props.plan.product_name }
						} )
					}
				</h1>
			</Card>
		);
	}
} );

export default PlanStatus;
