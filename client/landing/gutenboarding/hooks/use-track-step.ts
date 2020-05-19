/**
 * External dependencies
 */
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import { useOnUnmount } from './use-on-unmount';
import { StepNameType } from '../path';
import { recordEnterStep, recordLeaveStep } from '../lib/analytics';
import { TracksEventProperties } from '../lib/analytics/types';

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
