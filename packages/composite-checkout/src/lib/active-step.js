/**
 * External dependencies
 */
import React, { createContext, useContext, useMemo } from 'react';

const ActiveStepContext = createContext();

export const ActiveStepProvider = ( { step, steps, children } ) => {
	if ( ! step ) {
		throw new Error( 'ActiveStepProvider requires a step object' );
	}
	const value = useMemo( () => ( { step, steps } ), [ step, steps ] );
	return <ActiveStepContext.Provider value={ value }>{ children }</ActiveStepContext.Provider>;
};

export const useActiveStep = () => {
	const { step } = useContext( ActiveStepContext );
	if ( ! step ) {
		throw new Error( 'useActiveStep can only be used inside an ActiveStepProvider' );
	}
	return step;
};

export const useSteps = () => {
	const { steps } = useContext( ActiveStepContext );
	if ( ! steps ) {
		throw new Error( 'useSteps can only be used inside an ActiveStepProvider' );
	}
	return steps;
};

const RenderedStepContext = createContext();

export const RenderedStepProvider = ( { stepId, children } ) => (
	<RenderedStepContext.Provider value={ stepId }>{ children }</RenderedStepContext.Provider>
);

export const useIsStepActive = () => {
	const stepId = useContext( RenderedStepContext );
	const activeStep = useActiveStep();
	if ( ! stepId ) {
		throw new Error( 'useIsStepActive can only be used inside an RenderedStepProvider' );
	}
	return stepId === activeStep.id;
};

const useThisStep = () => {
	const stepId = useContext( RenderedStepContext );
	if ( ! stepId ) {
		throw new Error( 'useThisStep can only be used inside an RenderedStepProvider' );
	}
	const steps = useSteps();
	return steps.find( step => step.id === stepId );
};

export const useIsStepComplete = () => {
	const thisStep = useThisStep();
	return !! thisStep.isComplete;
};
