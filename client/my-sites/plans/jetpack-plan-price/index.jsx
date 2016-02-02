/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'JetpackPlanPrice',

	render: function() {
		return (
			<div className="jetpack-plan-price">
				<span className="jetpack-price">{ this.props.plan.formatted_original_price }</span>
				<small className="jetpack-plan-price__billing-period">
					{ this.translate( 'cost of individual plugins' ) }
				</small>
				<span className="jetpack-price">{ this.props.getPrice() }</span>
				<small className="jetpack-plan-price__billing-period">
					{ this.props.hasDiscount ? this.translate( 'for first year' ) : this.props.plan.bill_period_label } (
					{ this.props.plan.saving }
					{ this.translate( '% savings', { context: 'A percentage discount, eg: 20% savings' } ) })
				</small>
			</div>
		);
	}
} );
