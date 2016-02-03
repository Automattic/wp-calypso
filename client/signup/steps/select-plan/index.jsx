/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlansStepComponent from 'signup/steps/plans';

module.exports = React.createClass( {
	displayName: 'SelectPlanStep',

	render: function() {
		return (
			<div className="select-plan-step">
				<PlansStepComponent
					hideFreePlan
					{ ...this.props }
				/>
			</div>
		);
	}
} );
