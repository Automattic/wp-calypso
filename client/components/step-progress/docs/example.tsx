/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import StepProgress from 'components/step-progress';

const StepProgressExample: FunctionComponent = () => (
	<StepProgress
		steps={ [ 'You got this!?', 'Host locator', 'Credentials', 'Verification' ] }
		currentStep={ 1 }
	/>
);

export default StepProgressExample;
