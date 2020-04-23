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

/**
 * Records an event in tracks on entering and leaving the step.
 * When completing the step, additional properties can be recorded e.g. which theme was selected.
 *
 * @param stepName The name of the signup step to track
 * @param eventProperties Additional properties to be recorded on completing the step
 * @param deps Dependencies as will be passeed into react's useEffect
 */
export function useTrackStep( stepName: StepNameType, eventProperties?: any, deps?: any ) {
	useOnUnmount( () => {
		recordLeaveStep( stepName, eventProperties );
	}, deps || [] );
	useEffect( () => {
		recordEnterStep( stepName );
	}, [] );
}
