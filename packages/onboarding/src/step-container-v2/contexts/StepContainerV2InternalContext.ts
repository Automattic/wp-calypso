import { createContext, useContext } from 'react';

export interface StepContainerV2InternalContextType {
	isMediumViewport: boolean;
	isLargeViewport: boolean;
}

const StepContainerV2InternalContext = createContext< StepContainerV2InternalContextType | null >(
	null
);

export const StepContainerV2InternalProvider = StepContainerV2InternalContext.Provider;

export const useStepContainerV2InternalContext = () => {
	const context = useContext( StepContainerV2InternalContext );

	if ( ! context ) {
		throw new Error(
			'useStepContainerV2InternalContext must be used within a StepContainerV2InternalProvider'
		);
	}

	return context;
};
