import { ReactNode, createContext, useCallback, useMemo, useState } from 'react';
import { Tour } from 'calypso/a8c-for-agencies/components/guided-tour';

type GuidedTourContextType = {
	currentStep: Tour | null;
	currentStepCount: number;
	stepsCount: number;
	nextStep: () => void;
	endTour: () => void;
	registerRenderedStep: ( stepId: string ) => void;
	unregisterRenderedStep: ( stepId: string ) => void;
	tourDismissed: boolean;
};

const defaultGuidedTourContextValue = {
	currentStep: null,
	currentStepCount: 0,
	stepsCount: 0,
	nextStep: () => {},
	endTour: () => {},
	registerRenderedStep: () => {},
	unregisterRenderedStep: () => {},
	tourDismissed: false,
};

export const GuidedTourContext = createContext< GuidedTourContextType >(
	defaultGuidedTourContextValue
);

/**
 * Guided Tour Context Provider
 * Provides access to interact with the contextually relevant guided tour.
 */
export const GuidedTourContextProvider = ( {
	children,
	steps = [],
}: {
	children?: ReactNode;
	steps?: Tour[];
} ) => {
	const [ renderedSteps, setRenderedSteps ] = useState< string[] >( [] );
	const [ completedSteps, setCompletedSteps ] = useState< string[] >( [] );
	const [ tourDismissed, setTourDismissed ] = useState< boolean >( false );

	/**
	 * Derive current tour state from the available vs completed steps.
	 */
	const { currentStep, currentStepCount, stepsCount } = useMemo( () => {
		return steps.reduce(
			( carry, step ) => {
				if ( renderedSteps.includes( step.id ) ) {
					carry.stepsCount++;
					if ( ! carry.currentStep && ! completedSteps.includes( step.id ) ) {
						carry.currentStep = step;
						carry.currentStepCount = carry.stepsCount;
					}
				}
				return carry;
			},
			{
				currentStep: null,
				currentStepCount: 0,
				stepsCount: 0,
			}
		);
	}, [ steps, renderedSteps, completedSteps ] );

	/**
	 * Proceed to the next available step in the tour.
	 */
	const nextStep = useCallback( () => {
		if ( currentStep ) {
			setCompletedSteps( ( currentSteps ) => [ ...currentSteps, currentStep.id ] );
		}
	}, [ currentStep ] );

	/**
	 * Dismiss all steps in the tour.
	 */
	const endTour = () => setTourDismissed( true );

	const registerRenderedStep = useCallback( ( stepId: string ) => {
		setRenderedSteps( ( currentSteps ) => {
			if ( ! currentSteps.includes( stepId ) ) {
				return [ ...currentSteps, stepId ];
			}
			return currentSteps;
		} );
	}, [] );

	const unregisterRenderedStep = useCallback( ( stepId: string ) => {
		setRenderedSteps( ( currentSteps ) => currentSteps.filter( ( step ) => step !== stepId ) );
	}, [] );

	return (
		<GuidedTourContext.Provider
			value={ {
				stepsCount,
				currentStep,
				currentStepCount,
				nextStep,
				endTour,
				registerRenderedStep,
				unregisterRenderedStep,
				tourDismissed,
			} }
		>
			{ children }
		</GuidedTourContext.Provider>
	);
};
