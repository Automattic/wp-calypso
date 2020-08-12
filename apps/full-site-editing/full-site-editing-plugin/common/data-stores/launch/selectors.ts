/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { LaunchSequence, LaunchStep } from './data';
import type { State } from './reducer';
import { LaunchStepType } from './types';

export const getLaunchSequence = () => LaunchSequence;
export const getLaunchStep = () => LaunchStep;

export const getState = ( state: State ) => state;
export const hasPaidDomain = ( state: State ): boolean => {
	if ( ! state.domain ) {
		return false;
	}
	return ! state.domain.is_free;
};
export const getSelectedDomain = ( state: State ) => state.domain;
export const getSelectedPlan = ( state: State ) => state.plan;

// Completion status of steps is derived from the state of the launch flow
export const isStepCompleted = ( state: State, step: LaunchStepType ) => {
	if ( step === LaunchStep.Plan ) {
		return !! getSelectedPlan( state );
	}
	if ( step === LaunchStep.Name ) {
		const site = select( 'core' ).getEntityRecord( 'root', 'site', undefined );
		return !! site?.title;
	}
	if ( step === LaunchStep.Domain ) {
		return !! getSelectedDomain( state ) || state.confirmedDomainSelection;
	}
	return false;
};

// Check if all steps are completed except the final one
export const isFlowCompleted = ( state: State ) =>
	LaunchSequence.filter( ( step ) => step === LaunchStep.Final ).map( ( step ) =>
		isStepCompleted( state, step )
	);

// Check if at least one step is completed
export const isFlowStarted = ( state: State ) =>
	LaunchSequence.some( ( step ) => isStepCompleted( state, step ) );
