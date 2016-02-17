/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlansStep from 'signup/steps/plans';

export default React.createClass( {
	displayName: 'PaidPlansOnly',

	render: function() {
		return (
			<div className="paid-plans-only">
				<PlansStep
					hideFreePlan
					{ ...this.props }
				/>
			</div>
		);
	}
} );
