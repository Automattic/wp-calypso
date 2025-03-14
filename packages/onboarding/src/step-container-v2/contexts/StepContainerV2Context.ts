import { createContext, useContext } from 'react';

export interface StepContainerV2ContextType {
	flowName: string;
	stepName: string;
	recordTracksEvent: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
}

const StepContainerV2Context = createContext< StepContainerV2ContextType | null >( null );

export const StepContainerV2Provider = StepContainerV2Context.Provider;

export const useStepContainerV2Context = () => {
	const context = useContext( StepContainerV2Context );

	if ( ! context ) {
		throw new Error( 'useStepContainerV2Context must be used within a StepContainerV2Provider' );
	}

	return context;
};
