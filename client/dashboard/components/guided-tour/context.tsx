import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { createContext, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useAnalytics } from '../../app/analytics';
import type { ReactNode } from 'react';

export type TourStep = {
	id: string;
	title: string;
	description: JSX.Element | string;
	skippable?: boolean;
};

type GuidedTourContextType = {
	guidedTours: TourStep[];
	currentStep: number;
	totalSteps: number;
	isCompleted: boolean;
	isSkippable?: boolean;
	startTour: () => void;
	endTour: () => void;
	previousStep: () => void;
	nextStep: () => void;
};

const defaultGuidedTourContextValue = {
	guidedTours: [],
	currentStep: 0,
	totalSteps: 0,
	isCompleted: false,
	isSkippable: false,
	startTour: () => {},
	endTour: () => {},
	previousStep: () => {},
	nextStep: () => {},
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
	tourId,
	isSkippable,
}: {
	children: ReactNode;
	guidedTours: TourStep[];
	tourId: `hosting-dashboard-tours-${ string }`;
	isSkippable?: boolean;
} ) => {
	const { recordTracksEvent } = useAnalytics();
	const { data: completedISODate, isLoading } = useQuery( userPreferenceQuery( tourId ) );
	const { mutate: updateCompletedTimestamp, isPending: isDismissing } = useMutation(
		userPreferenceMutation( tourId )
	);

	const isStartedRef = useRef( false );
	const isCompleted = isDismissing || !! completedISODate;

	const [ currentStep, setCurrentStep ] = useState( 0 );

	const startTour = useCallback( () => {
		if ( ! isStartedRef.current ) {
			isStartedRef.current = true;
			recordTracksEvent( 'calypso_dashboard_start_tour', { tour_id: tourId } );
		}
	}, [ isStartedRef, tourId, recordTracksEvent ] );

	const endTour = useCallback( () => {
		// Save the dismissed timestamp so we can show the new steps that are added after it in the future.
		updateCompletedTimestamp( new Date().toISOString() );
		recordTracksEvent( 'calypso_dashboard_end_tour', {
			tour_id: tourId,
			is_completed: currentStep === guidedTours.length,
		} );
	}, [ tourId, updateCompletedTimestamp, recordTracksEvent, currentStep, guidedTours.length ] );

	const previousStep = useCallback( () => {
		setCurrentStep( ( step ) => {
			const nextStep = Math.max( step - 1, 0 );
			recordTracksEvent( 'calypso_dashboard_tour_previous_step', {
				tour_id: tourId,
				to: nextStep,
			} );

			return nextStep;
		} );
	}, [ tourId, recordTracksEvent ] );

	const nextStep = useCallback( () => {
		setCurrentStep( ( step ) => {
			const nextStep = step + 1;
			if ( nextStep < guidedTours.length ) {
				recordTracksEvent( 'calypso_dashboard_tour_next_step', {
					tour_id: tourId,
					to: nextStep,
				} );
			}

			return nextStep;
		} );
	}, [ tourId, guidedTours.length, recordTracksEvent ] );

	const value = useMemo(
		() => ( {
			guidedTours,
			currentStep,
			totalSteps: guidedTours.length,
			isCompleted,
			isSkippable,
			startTour,
			endTour,
			previousStep,
			nextStep,
		} ),
		[
			guidedTours,
			currentStep,
			isCompleted,
			isSkippable,
			startTour,
			endTour,
			previousStep,
			nextStep,
		]
	);

	useEffect( () => {
		if ( currentStep === guidedTours.length && ! isCompleted ) {
			endTour();
		}
	}, [ currentStep, guidedTours, isCompleted, endTour ] );

	if ( isLoading || isCompleted ) {
		return null;
	}

	return <GuidedTourContext.Provider value={ value }>{ children }</GuidedTourContext.Provider>;
};
