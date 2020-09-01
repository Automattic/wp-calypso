/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

interface Props {
	steps: string[];
	currentStep: number;
}

const StepProgress: FunctionComponent< Props > = ( { steps } ) => (
	<div className="step-progress">
		<ol>
			{ steps.map( ( stepName ) => (
				<li>{ stepName }</li>
			) ) }
		</ol>
	</div>
);

export default StepProgress;
