import { DomainConnectionSetupMode } from '@automattic/api-core';
import {
	StepType,
	StepName,
	DomainConnectionStepsMap,
	DomainConnectionProgressStepList,
} from './types';

export const getStepName = (
	mode: DomainConnectionSetupMode,
	step: StepType,
	stepsDefinition: DomainConnectionStepsMap
) => {
	const matchingEntry = Object.entries( stepsDefinition ).find( ( [ , pageDefinition ] ) => {
		return pageDefinition.mode === mode && pageDefinition.step === step;
	} );
	return matchingEntry?.[ 0 ] as StepName | undefined;
};

export const getProgressStepList = (
	mode: DomainConnectionSetupMode,
	stepsDefinition: DomainConnectionStepsMap
): DomainConnectionProgressStepList => {
	const modeSteps = Object.fromEntries(
		Object.entries( stepsDefinition ).filter(
			( [ , pageDefinition ] ) => pageDefinition.mode === mode
		)
	);

	let step = Object.values( modeSteps ).find(
		( pageDefinition ) => pageDefinition.step === StepType.START
	);

	const stepList = [];
	while ( step?.next ) {
		const found = Object.entries( modeSteps ).find( ( [ slug ] ) => slug === step?.next );

		if ( ! found ) {
			break;
		}

		const [ nextSlug, nextStep ] = found;
		stepList.push( [ nextSlug, nextStep.name ] );

		step = nextStep;
	}

	return Object.fromEntries( stepList );
};
