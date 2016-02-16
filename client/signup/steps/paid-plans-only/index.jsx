/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlansStepComponent from 'signup/steps/plans';

module.exports = React.createClass( {
	displayName: 'PaidPlansOnly',

	render: function() {
		return (
			<div className="paid-plans-only">
				<PlansStepComponent
					hideFreePlan
					{ ...this.props }
				/>
			</div>
		);
	}
} );
