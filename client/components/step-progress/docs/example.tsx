import { Button } from '@automattic/components';
import { FunctionComponent, useState } from 'react';
import StepProgress from 'calypso/components/step-progress';
import type { ClickHandler } from '../index';

const StepProgressExample: FunctionComponent = () => {
	const [ currentStep, setCurrentStep ] = useState( 0 );

	const steps: ( ClickHandler | string )[] = [
		{
			message: 'You got this!',
			onClick: () => setCurrentStep( 0 ),
		},
		{
			message: 'Host locator ( clickable once complete )',
			onClick: () => setCurrentStep( 1 ),
			show: 'onComplete',
		},
		'Credentials ( no click handler )',
		{
			message: 'Verification',
			onClick: () => setCurrentStep( 3 ),
		},
	];

	return (
		<div>
			<div style={ { background: 'var( --color-surface )', padding: '30px' } }>
				<StepProgress steps={ steps } currentStep={ currentStep } />
			</div>

			<div style={ { marginTop: '30px' } }>
				<Button
					disabled={ currentStep <= 0 }
					onClick={ () => setCurrentStep( currentStep - 1 ) }
					style={ { marginRight: '10px' } }
				>
					{ 'Previous Step' }
				</Button>
				<Button
					primary
					disabled={ currentStep >= steps.length }
					onClick={ () => setCurrentStep( currentStep + 1 ) }
				>
					{ currentStep < steps.length - 1 ? 'Next Step' : 'Finish' }
				</Button>
			</div>
		</div>
	);
};

StepProgressExample.displayName = 'StepProgressExample';

export default StepProgressExample;
