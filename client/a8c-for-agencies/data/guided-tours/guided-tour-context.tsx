import { ReactNode, createContext, useCallback, useMemo, useState } from 'react';
import useGuidedTour, { type TourId } from './use-guided-tours';

type TourStep = {
	id: string;
	popoverPosition: string;
	title: string;
	description: JSX.Element | string;
	nextStepOnTargetClick?: boolean;
	forceShowSkipButton?: boolean;
};

type GuidedTourContextType = {
	currentTourId: TourId | null;
	startTour: ( id: TourId ) => void;
	currentStep: TourStep | null;
	currentStepCount: number;
	stepsCount: number;
	nextStep: () => void;
};

const defaultGuidedTourContextValue = {
	currentTourId: null,
	startTour: () => {},
	currentStep: null,
	currentStepCount: 0,
	stepsCount: 0,
	nextStep: () => {},
};

export const GuidedTourContext = createContext< GuidedTourContextType >(
	defaultGuidedTourContextValue
);

/**
 * Guided Tour Context Provider
 * Provides access to interact with the contextually relevant guided tour.
 */
export const GuidedTourContextProvider = ( { children }: { children?: ReactNode } ) => {
	const [ currentTourId, setCurrentTourId ] = useState< TourId | null >( null );
	const [ completedSteps, setCompletedSteps ] = useState< string[] >( [] );

	const currentTour: TourStep[] = useGuidedTour( currentTourId );

	/**
	 * Derive current tour state from the available vs completed steps.
	 */
	type DerivedTourState = {
		currentStep: TourStep | null;
		currentStepCount: number;
		stepsCount: number;
	};
	const { currentStep, currentStepCount, stepsCount } = useMemo< DerivedTourState >( () => {
		return currentTour.reduce(
			( carry: DerivedTourState, step: TourStep ) => {
				carry.stepsCount++;
				if ( ! carry.currentStep && ! completedSteps.includes( step.id ) ) {
					carry.currentStep = step;
					carry.currentStepCount = carry.stepsCount;
				}
				return carry;
			},
			{
				currentStep: null,
				currentStepCount: 0,
				stepsCount: 0,
			} as DerivedTourState
		);
	}, [ currentTour, completedSteps ] );

	/**
	 * Set the active guided tour.
	 */
	const startTour = useCallback( ( id: TourId ) => {
		setCurrentTourId( id );
	}, [] );

	/**
	 * Proceed to the next available step in the active tour.
	 */
	const nextStep = useCallback( () => {
		if ( currentStep ) {
			setCompletedSteps( ( currentSteps ) => [ ...currentSteps, currentStep.id ] );
		}
	}, [ currentStep ] );

	const contextValue = useMemo(
		() => ( {
			startTour,
			nextStep,
			currentTourId,
			stepsCount,
			currentStep,
			currentStepCount,
		} ),
		[ startTour, nextStep, currentTourId, stepsCount, currentStep, currentStepCount ]
	);

	return (
		<GuidedTourContext.Provider value={ contextValue }>{ children }</GuidedTourContext.Provider>
	);
};
