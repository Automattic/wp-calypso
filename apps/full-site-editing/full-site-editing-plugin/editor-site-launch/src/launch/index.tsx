/**
 * External dependencies
 */
import * as React from 'react';
import type { ValuesType } from 'utility-types';

/**
 * Internal dependencies
 */
import DomainStep from '../launch-steps/domain-step';
import PlanStep from '../launch-steps/plan-step';
import './styles.scss';

export const LaunchStep = {
	Domain: 'domain',
	Plan: 'plan',
};

export type LaunchStepType = ValuesType< typeof LaunchStep >;

const LaunchStepComponents = {
	[ LaunchStep.Domain ]: DomainStep,
	[ LaunchStep.Plan ]: PlanStep,
};

const LaunchSequence = [ LaunchStep.Domain, LaunchStep.Plan ];

interface Props {
	step?: LaunchStepType;
	onSubmit?: () => void;
}

const Launch: React.FunctionComponent< Props > = ( { step = LaunchStep.Domain, onSubmit } ) => {
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
		const nextSequence = currentSequence + 1;
		const maxSequence = LaunchSequence.length - 1;
		if ( nextSequence > maxSequence ) {
			onSubmit?.();
		}
		setCurrentSequence( nextSequence );
	};

	return (
		<div className="nux-launch">
			<CurrentLaunchStep onPrevStep={ handlePrevStep } onNextStep={ handleNextStep } />
		</div>
	);
};

export default Launch;
