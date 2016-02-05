/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlansStepComponent from 'signup/steps/plans';

module.exports = React.createClass( {
	displayName: 'PaidPlansWithFreeTrialsStep',

	render: function() {
		return (
			<div className="paid-plans-with-free-trials">
				<PlansStepComponent
					hideFreePlan
					enableFreeTrials
					{ ...this.props }
				/>
			</div>
		);
	}
} );
