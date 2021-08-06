import { useEffect } from 'react';
import { recordEnterStep, recordLeaveStep } from '../lib/analytics';
import { useOnUnmount } from './use-on-unmount';
import type { TracksEventProperties } from '../lib/analytics/types';
import type { StepNameType } from '../path';

/**
 * Records an event in tracks on entering and leaving the step.
 * When completing the step, additional properties can be recorded e.g. which theme was selected.
 *
 * @param stepName The name of the signup step to track
 * @param getEventProperties Returns additional properties to be recorded on completing the step
 */
export function useTrackStep(
	stepName: StepNameType,
	getEventProperties?: () => TracksEventProperties
) {
	useOnUnmount( () => {
		recordLeaveStep( stepName, getEventProperties && getEventProperties() );
	} );
	useEffect( () => {
		recordEnterStep( stepName );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
}
