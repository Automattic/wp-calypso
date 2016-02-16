/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PaidPlansOnlyStep from 'signup/steps/paid-plans-only';

export default React.createClass( {
	displayName: 'PaidPlansWithSkip',

	render: function() {
		return (
			<div className="paid-plans-with-skip">
				<PaidPlansOnlyStep
					showSkipStepButton
					{ ...this.props } />
			</div>
		);
	}
} );
