import { Button } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { FunctionComponent, useState } from 'react';
import StepProgress from 'calypso/components/step-progress';
import type { ClickHandler } from '../index';

const StepProgressExample: FunctionComponent = () => {
	const [ currentStep, setCurrentStep ] = useState( 0 );

	const steps: ( ClickHandler | string )[] = [
		{
			message: 'You got this!',
			onClick: () => setCurrentStep( 0 ),
			indicator: <Icon icon={ check } />,
		},
		{
			message: 'In Progress',
			onClick: () => setCurrentStep( 1 ),
			indicator: <Spinner style={ { color: 'red' } } />,
			show: 'onComplete',
		},
		{
			message: 'Host locator ( clickable once complete )',
			onClick: () => setCurrentStep( 2 ),
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
					Previous Step
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
