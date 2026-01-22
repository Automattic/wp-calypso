import { createContext, useContext, type ReactNode } from 'react';

export type StepContainerV2ContextType = null | {
	flowName?: string;
	stepName?: string;
	recordTracksEvent?: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
	logo?: ReactNode;
};

const StepContainerV2Context = createContext< StepContainerV2ContextType >( null );

export const StepContainerV2Provider = StepContainerV2Context.Provider;

export const useStepContainerV2Context = () => {
	return useContext( StepContainerV2Context );
};
