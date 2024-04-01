import { ReactNode, createContext, useCallback, useMemo, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import {
	getPreference,
	preferencesLastFetchedTimestamp,
} from 'calypso/state/preferences/selectors';
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
	endTour: () => void;
	currentStep: TourStep | null;
	currentStepCount: number;
	stepsCount: number;
	nextStep: () => void;
	showTour: boolean;
};

const defaultGuidedTourContextValue = {
	currentTourId: null,
	startTour: () => {},
	endTour: () => {},
	currentStep: null,
	currentStepCount: 0,
	stepsCount: 0,
	nextStep: () => {},
	showTour: false,
};

export const GuidedTourContext = createContext< GuidedTourContextType >(
	defaultGuidedTourContextValue
);

/**
 * Guided Tour Context Provider
 * Provides access to interact with the contextually relevant guided tour.
 */
export const GuidedTourContextProvider = ( { children }: { children?: ReactNode } ) => {
	const dispatch = useDispatch();
	const [ currentTourId, setCurrentTourId ] = useState< TourId | null >( null );
	const [ completedSteps, setCompletedSteps ] = useState< string[] >( [] );

	const preference = useSelector( ( state ) =>
		currentTourId ? getPreference( state, currentTourId ) : undefined
	);
	const hasFetched = !! useSelector( preferencesLastFetchedTimestamp );
	const showTour = hasFetched && ! preference?.dismiss;

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

	const startTour = useCallback( ( id: TourId ) => {
		setCurrentTourId( id );
	}, [] );

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
	const endTour = useCallback( () => {
		if ( ! currentTourId ) {
			return;
		}

		dispatch( savePreference( currentTourId, { ...preference, dismiss: true } ) );
		dispatch(
			recordTracksEvent( 'calypso_a4a_end_tour', {
				tour: currentTourId,
			} )
		);
		// if ( redirectAfterTourEnds ) {
		// 	page.redirect( redirectAfterTourEnds );
		// }
		// setTourDismissed( true );
	}, [ currentTourId, dispatch, preference ] );

	const contextValue = useMemo(
		() => ( {
			startTour,
			endTour,
			nextStep,
			currentTourId,
			stepsCount,
			currentStep,
			currentStepCount,
			showTour,
		} ),
		[
			startTour,
			endTour,
			nextStep,
			currentTourId,
			stepsCount,
			currentStep,
			currentStepCount,
			showTour,
		]
	);

	return (
		<GuidedTourContext.Provider value={ contextValue }>{ children }</GuidedTourContext.Provider>
	);
};
