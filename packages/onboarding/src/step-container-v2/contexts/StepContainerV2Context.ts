import { createContext, useContext, type ReactNode } from 'react';

export type StepContainerV2ContextType = {
	flowName: string;
	stepName: string;
	recordTracksEvent: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
	logo: ReactNode;
};

const defaultContextValue: StepContainerV2ContextType = {
	flowName: '',
	stepName: '',
	recordTracksEvent: () => {},
	logo: null,
};

const StepContainerV2Context = createContext< StepContainerV2ContextType >( defaultContextValue );

export const StepContainerV2Provider = StepContainerV2Context.Provider;

export const useStepContainerV2Context = () => {
	return useContext( StepContainerV2Context );
};
