import { DomainConnectionSetupMode } from '@automattic/api-core';
import { StepType, StepName, DomainConnectionStepsMap } from './types';

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
	mode: DomainConnectionSetupMode | null,
	stepsDefinition: DomainConnectionStepsMap
): StepType[] => {
	const progressStepList = Object.entries( stepsDefinition )
		.filter( ( [ , pageDefinition ] ) => {
			return pageDefinition.mode === mode;
		} )
		.map( ( [ , pageDefinition ] ) => pageDefinition.step );
	return progressStepList;
};
