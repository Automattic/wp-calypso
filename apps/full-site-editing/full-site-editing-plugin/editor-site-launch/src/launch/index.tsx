/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { EntityProvider } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';
import { LaunchStep, LaunchSequence } from '../../../common/data-stores/launch/data';
import type { LaunchStepType } from '../../../common/data-stores/launch/types';
import NameStep from '../launch-steps/name-step';
import DomainStep from '../launch-steps/domain-step';
import PlanStep from '../launch-steps/plan-step';
import FinalStep from '../launch-steps/final-step';
import './styles.scss';

const LaunchStepComponents = {
	[ LaunchStep.Name ]: NameStep,
	[ LaunchStep.Domain ]: DomainStep,
	[ LaunchStep.Plan ]: PlanStep,
	[ LaunchStep.Final ]: FinalStep,
};

interface Props {
	step?: LaunchStepType;
	onSubmit?: () => void;
}

const Launch: React.FunctionComponent< Props > = ( { onSubmit } ) => {
	const { step: currentStep } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const { setStep } = useDispatch( LAUNCH_STORE );

	const currentSequence = LaunchSequence.indexOf( currentStep );

	const handlePrevStep = () => {
		let prevSequence = currentSequence - 1;
		if ( prevSequence < 0 ) {
			prevSequence = 0;
		}

		setStep( LaunchSequence[ prevSequence ] );
	};

	const handleNextStep = () => {
		const nextSequence = currentSequence + 1;
		const maxSequence = LaunchSequence.length - 1;
		if ( nextSequence > maxSequence ) {
			onSubmit?.();
		}
		setStep( LaunchSequence[ nextSequence ] );
	};

	const CurrentLaunchStep = LaunchStepComponents[ currentStep ];

	return (
		<div className="nux-launch">
			<EntityProvider kind="root" type="site">
				<CurrentLaunchStep onPrevStep={ handlePrevStep } onNextStep={ handleNextStep } />
			</EntityProvider>
		</div>
	);
};

export default Launch;
