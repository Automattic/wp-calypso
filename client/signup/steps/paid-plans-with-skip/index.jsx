/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PaidPlansOnlyStep from 'signup/steps/paid-plans-only';

const PaidPlansWithSkip = ( props ) => (
	<div className="paid-plans-with-skip">
		<PaidPlansOnlyStep
			showSkipStepButton
			{ ...props } />
	</div>
);

export default PaidPlansWithSkip;
