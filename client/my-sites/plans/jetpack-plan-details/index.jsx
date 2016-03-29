/**
 * External dependencies
 */
import React from 'react';

const JetpackPlanDetails = React.createClass( {
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

export default JetpackPlanDetails;
