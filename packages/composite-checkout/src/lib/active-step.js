/**
 * External dependencies
 */
import React, { createContext, useContext } from 'react';

const ActiveStepContext = createContext();

export const ActiveStepProvider = ( { step, children } ) => {
	if ( ! step ) {
		throw new Error( 'ActiveStepProvider requires a step object' );
	}
	return <ActiveStepContext.Provider value={ step }>{ children }</ActiveStepContext.Provider>;
};

export const useActiveStep = () => {
	const step = useContext( ActiveStepContext );
	if ( ! step ) {
		throw new Error( 'useActiveStep can only be used inside an ActiveStepProvider' );
	}
	return step;
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
