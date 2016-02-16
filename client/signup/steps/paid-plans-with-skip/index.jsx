/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PaidPlansOnlyStepComponent from 'signup/steps/paid-plans-only';

export default React.createClass( {
	displayName: 'PaidPlansWithSkip',

	render: function() {
		return (
			<div className="paid-plans-with-skip">
				<PaidPlansOnlyStepComponent
					showSkipStepButton
					{ ...this.props } />
			</div>
		);
	}
} );
