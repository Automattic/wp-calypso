import { ReactNode, createContext, useCallback, useMemo, useState } from 'react';

export type TourStep = {
	id: string;
	popoverPosition: string;
	title: string;
	description: JSX.Element | string;
	nextStepOnTargetClick?: boolean;
	forceShowSkipButton?: boolean;
	classNames?: {
		nextStepButton?: string;
	};
};

type GuidedTourContextType = {
	currentTourId: string | null;
	startTour: ( id: string ) => void;
	currentStep: TourStep | null;
	currentStepCount: number;
	stepsCount: number;
	nextStep: ( completedStep: TourStep | null ) => void;
	preferenceNames: Record< string, string >;
	eventNames: Record< string, string >;
};

type GuidedTourContextProviderProps = {
	children: ReactNode;
	guidedTours: Record< string, TourStep[] >;
	preferenceNames: Record< string, string >;
	eventNames: Record< string, string >;
};

const defaultGuidedTourContextValue = {
	currentTourId: null,
	startTour: () => {},
	currentStep: null,
	currentStepCount: 0,
	stepsCount: 0,
	nextStep: () => {},
	guidedTours: {},
	preferenceNames: {},
	eventNames: {},
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
	guidedTours,
	preferenceNames,
	eventNames,
}: GuidedTourContextProviderProps ) => {
	const [ currentTourId, setCurrentTourId ] = useState< string >( '' );
	const [ completedSteps, setCompletedSteps ] = useState< string[] >( [] );
	const currentTour: TourStep[] = guidedTours[ currentTourId ] ?? [];

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
	const startTour = useCallback( ( id: string ) => {
		setCurrentTourId( id );
	}, [] );

	/**
	 * Proceed to the next available step in the active tour.
	 */
	const nextStep = useCallback( ( completedStep: TourStep | null ) => {
		if ( completedStep ) {
			setCompletedSteps( ( currentSteps ) => [ ...currentSteps, completedStep.id ] );
		}
	}, [] );

	const contextValue = useMemo(
		() => ( {
			startTour,
			nextStep,
			currentTourId,
			stepsCount,
			currentStep,
			currentStepCount,
			preferenceNames,
			eventNames,
		} ),
		[
			startTour,
			nextStep,
			currentTourId,
			stepsCount,
			currentStep,
			currentStepCount,
			preferenceNames,
			eventNames,
		]
	);

	return (
		<GuidedTourContext.Provider value={ contextValue }>{ children }</GuidedTourContext.Provider>
	);
};
