/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'WpcomPlanPrice',

	render: function() {
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
