/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
/**
 * Internal dependencies
 */
import NameStep from '../launch-steps/name-step';
import DomainStep from '../launch-steps/domain-step';
import PlanStep from '../launch-steps/plan-step';
import FinalStep from '../launch-steps/final-step';
import { LAUNCH_STORE } from '../stores';

import './styles.scss';

interface Props {
	onSubmit?: () => void;
}

const Launch: React.FunctionComponent< Props > = ( { onSubmit } ) => {
	const { step: currentStep } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	const LaunchStep = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchStep() );
	const LaunchSequence = useSelect( ( select ) => select( LAUNCH_STORE ).getLaunchSequence() );
	const firstIncompleteStep = useSelect( ( select ) =>
		select( LAUNCH_STORE ).getFirstIncompleteStep()
	);

	const { setStep, setSidebarFullscreen, unsetSidebarFullscreen } = useDispatch( LAUNCH_STORE );

	const LaunchStepComponents = {
		[ LaunchStep.Name ]: NameStep,
		[ LaunchStep.Domain ]: DomainStep,
		[ LaunchStep.Plan ]: PlanStep,
		[ LaunchStep.Final ]: FinalStep,
	};

	const currentSequence = LaunchSequence.indexOf( currentStep );

	const handlePrevStep = () => {
		let prevSequence = currentSequence - 1;
		if ( prevSequence < 0 ) {
			prevSequence = 0;
			setSidebarFullscreen();
		}
		setStep( LaunchSequence[ prevSequence ] );
	};

	const handleNextStep = () => {
		const nextSequence = currentSequence + 1;
		const maxSequence = LaunchSequence.length - 1;
		if ( nextSequence > maxSequence ) {
			onSubmit?.();
		}
		unsetSidebarFullscreen();
		setStep( LaunchSequence[ nextSequence ] );
	};

	const CurrentLaunchStep = LaunchStepComponents[ currentStep ];

	React.useEffect( () => {
		if ( firstIncompleteStep && firstIncompleteStep !== LaunchStep.Name ) {
			setStep( firstIncompleteStep );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return <CurrentLaunchStep onPrevStep={ handlePrevStep } onNextStep={ handleNextStep } />;
};

export default Launch;
