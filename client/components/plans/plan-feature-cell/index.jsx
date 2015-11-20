/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'PlanFeatureCell',

	render: function() {
		return (
			<div className="plan-feature-cell" key={ this.props.key } title={ this.props.title }>
				<div className="plan-feature-cell__feature-text">
					{ this.props.children }
				</div>
			</div>
		);
	}
} );
