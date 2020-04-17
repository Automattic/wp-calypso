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

export function recordLeaveStep( stepName: StepNameType, eventProperties?: any ) {
	recordTracksEvent( 'calypso_signup_step_leave', {
		flow: 'gutenboarding',
		step: stepName,
		...eventProperties,
	} );
}

export function recordEnterStep( stepName: StepNameType, eventProperties?: any ) {
	recordTracksEvent( 'calypso_signup_step_enter', {
		flow: 'gutenboarding',
		step: stepName,
		...eventProperties,
	} );
}

export function recordEnterModal( modalName: string, eventProperties?: any ) {
	recordTracksEvent( 'calypso_signup_modal_open', {
		flow: 'gutenboaridng',
		step: modalName,
		...eventProperties,
	} );
}

export function recordCloseModal( modalName: string, eventProperties?: any ) {
	recordTracksEvent( 'calypso_signup_modal_close', {
		flow: 'gutenboaridng',
		step: modalName,
		...eventProperties,
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

export function useTrackModal( modalName: string ) {
	useOnUnmount( () => {
		recordCloseModal( modalName );
	}, [] );
	useEffect( () => {
		recordEnterModal( modalName );
	}, [] );
}
