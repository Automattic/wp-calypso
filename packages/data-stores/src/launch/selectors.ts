/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { LaunchSequence, LaunchStep } from './data';
import type { State } from './reducer';
import type { LaunchStepType } from './types';
import type * as DomainSuggestions from '../domain-suggestions';
import type * as Plans from '../plans';

export const getLaunchSequence = (): typeof LaunchSequence => LaunchSequence;
export const getLaunchStep = (): typeof LaunchStep => LaunchStep;

export const getState = ( state: State ): State => state;
export const hasPaidDomain = ( state: State ): boolean => {
	if ( ! state.domain ) {
		return false;
	}
	return ! state.domain.is_free;
};
export const getSelectedDomain = ( state: State ): DomainSuggestions.DomainSuggestion | undefined =>
	state.domain;
export const getSelectedPlan = ( state: State ): Plans.Plan | undefined => state.plan;

// Completion status of steps is derived from the state of the launch flow
export const isStepCompleted = ( state: State, step: LaunchStepType ): boolean => {
	if ( step === LaunchStep.Plan ) {
		return !! getSelectedPlan( state );
	}
	if ( step === LaunchStep.Name ) {
		const site: { title?: string } | undefined = select( 'core' ).getEntityRecord(
			'root',
			'site',
			undefined
		);
		return !! site?.title;
	}
	if ( step === LaunchStep.Domain ) {
		return !! getSelectedDomain( state ) || state.confirmedDomainSelection;
	}
	return false;
};

// Check if all steps are completed except the last one
export const isFlowCompleted = ( state: State ): boolean =>
	LaunchSequence.slice( 0, LaunchSequence.length - 1 ).every( ( step ) =>
		isStepCompleted( state, step )
	);

// Check if at least one step is completed
export const isFlowStarted = ( state: State ): boolean =>
	LaunchSequence.some( ( step ) => isStepCompleted( state, step ) );

// Get first incomplete step
export const getFirstIncompleteStep = ( state: State ): LaunchStepType | undefined =>
	LaunchSequence.find( ( step ) => ! isStepCompleted( state, step ) );

// Check if site title step should be displayed
export const isSiteTitleStepVisible = ( state: State ): boolean => state.isSiteTitleStepVisible;

// Check if launch modal can be dismissed
export const isModalDismissible = ( state: State ): boolean => state.isModalDismissible;

// Check if launch modal title should be visible
export const isModalTitleVisible = ( state: State ): boolean => state.isModalTitleVisible;

// Check if launch modal can be dismissed
export const isFocusedLaunchOpen = ( state: State ): boolean => state.isFocusedLaunchOpen;
