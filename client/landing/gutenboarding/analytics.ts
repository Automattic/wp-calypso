/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import { useOnUnmount } from 'landing/gutenboarding/hooks/use-on-unmount';
import { StepNameType } from './path';

export function recordLeaveStep( stepName: StepNameType ) {
	recordTracksEvent( 'calypso_signup_step_leave', {
		flow: 'gutenboarding',
		step: stepName,
	} );
}

export function recordEnterStep( stepName: StepNameType ) {
	recordTracksEvent( 'calypso_signup_step_enter', {
		flow: 'gutenboarding',
		step: stepName,
	} );
}

export function useTrackStep( stepName: StepNameType ) {
	useOnUnmount( () => {
		recordLeaveStep( stepName );
	}, [] );
	useEffect( () => {
		recordEnterStep( stepName );
	}, [] );
}
