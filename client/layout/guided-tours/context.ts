import { createContext } from 'react';
import type { CalypsoDispatch } from 'calypso/state/types';

export type ContextWhen = ( ...args: unknown[] ) => boolean;

// Shared between the `makeTour` provider and its tour config-element consumers.
export interface TourContextValue {
	sectionName?: string;
	dispatch: CalypsoDispatch;
	step: string;
	shouldPause?: boolean;
	branching: Record< string, { continue: string } >;
	lastAction: { type: string; path: string };
	next: ( newCtx: Partial< TourContextValue > ) => void;
	nextStepName?: string;
	skipping?: boolean;
	tour: string;
	tourVersion: string;
	isValid: ( when: ContextWhen ) => boolean;
	isLastStep: boolean;
	quit: ( context: Partial< TourContextValue > ) => void;
	start: ( context: Partial< TourContextValue > ) => void;
}

// The provider always supplies a value, so consumers treat it as non-null.
export const TourContext = createContext< TourContextValue | null >( null );
