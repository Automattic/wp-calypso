/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'JetpackPlanDetails',

	render: function() {
		return (
			<div>
				<p>{ this.props.plan.description }</p>
				<ul>
					<li>{ this.props.plan.feature_1 }</li>
					<li>{ this.props.plan.feature_2 }</li>
					<li>{ this.props.plan.feature_3 }</li>
				</ul>
			</div>
		);
	}
} );
