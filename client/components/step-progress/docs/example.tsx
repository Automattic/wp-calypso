/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import StepProgress from 'components/step-progress';

const steps = [ 'You got this!?', 'Host locator', 'Credentials', 'Verification' ];

const StepProgressExample: FunctionComponent = () => {
	const [ currentStep, setCurrentStep ] = useState( 0 );

	return (
		<div>
			<div style={ { background: 'var( --color-surface )', padding: '30px' } }>
				<StepProgress steps={ steps } currentStep={ currentStep } />
			</div>

			<div style={ { 'margin-top': '30px' } }>
				<Button
					disabled={ currentStep <= 0 }
					onClick={ () => setCurrentStep( currentStep - 1 ) }
					style={ { 'margin-right': '10px' } }
				>
					{ 'Previous Step' }
				</Button>
				<Button
					primary
					disabled={ currentStep >= steps.length - 1 }
					onClick={ () => setCurrentStep( currentStep + 1 ) }
				>
					{ 'Next Step' }
				</Button>
			</div>
		</div>
	);
};

export default StepProgressExample;
