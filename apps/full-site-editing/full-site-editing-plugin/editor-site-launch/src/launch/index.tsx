/**
 * External dependencies
 */
import * as React from 'react';
import type { ValuesType } from 'utility-types';

/**
 * Internal dependencies
 */
import PrivacyStep from '../launch-steps/privacy-step';
import DomainStep from '../launch-steps/domain-step';
import PlanStep from '../launch-steps/plan-step';
import './styles.scss';

export const LaunchStep = {
	Privacy: 'privacy',
	Domain: 'domain',
	Plan: 'plan',
};

export type LaunchStepType = ValuesType< typeof LaunchStep >;

const LaunchStepComponents = {
	[ LaunchStep.Privacy ]: PrivacyStep,
	[ LaunchStep.Domain ]: DomainStep,
	[ LaunchStep.Plan ]: PlanStep,
};

const LaunchSequence = [ LaunchStep.Privacy, LaunchStep.Domain, LaunchStep.Plan ];

interface Props {
	step?: LaunchStepType;
}

const Launch: React.FunctionComponent< Props > = ( { step = LaunchStep.Privacy } ) => {
	const initialSequence = LaunchSequence.indexOf( step );

	const [ currentSequence, setCurrentSequence ] = React.useState( initialSequence );

	const currentStepName = LaunchSequence[ currentSequence ];

	const CurrentLaunchStep = LaunchStepComponents[ currentStepName ];

	const handlePrevStep = () => {
		let prevSequence = currentSequence - 1;
		if ( prevSequence < 0 ) {
			prevSequence = 0;
		}
		setCurrentSequence( prevSequence );
	};

	const handleNextStep = () => {
		let nextSequence = currentSequence + 1;
		const maxSequence = LaunchSequence.length - 1;
		if ( nextSequence > maxSequence ) {
			nextSequence = maxSequence;
		}
		setCurrentSequence( nextSequence );
	};

	return (
		<div className="nux-launch">
			<CurrentLaunchStep
				onPrevStep={ handlePrevStep }
				onNextStep={ handleNextStep }
			></CurrentLaunchStep>
		</div>
	);
};

export default Launch;
