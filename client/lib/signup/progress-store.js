/** @format */

/**
 * External dependencies
 */

import { isEqual, get, isEmpty, omit } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:signup-progress-store' );

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import steps from 'signup/config/steps-pure';
import { SIGNUP_COMPLETE_RESET, SIGNUP_PROGRESS_SET } from 'state/action-types';
import {
	completeStep,
	processStep,
	removeUnneededSteps,
	saveStep,
	invalidateStep,
	submitStep,
} from 'state/signup/progress/actions';
import { getSignupProgress } from 'state/signup/progress/selectors';
import { getCurrentFlowName } from 'state/signup/flow/selectors';
import SignupDependencyStore from './dependency-store';

const SignupProgressStore = {
	currentValue: null,
	reduxStore: null,
	subscribers: new Map(),

	get() {
		if ( ! this.reduxStore ) {
			debug( 'Tried to read redux state before store was ready' );
			return [];
		}
		return getSignupProgress( this.reduxStore.getState() );
	},
	reset() {
		this.unsubscribeAll();
		this.reduxStore.dispatch( {
			type: SIGNUP_COMPLETE_RESET,
		} );
	},
	set( input ) {
		this.reduxStore.dispatch( {
			type: SIGNUP_PROGRESS_SET,
			steps: input,
		} );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	},

	// Subscriptions and change handling
	off( eventName, callback ) {
		eventName === 'change' && this.unsubscribe( callback );
	},
	on( eventName, callback ) {
		eventName === 'change' && this.subscribe( callback );
	},
	subscribe( callback ) {
		this.currentValue = this.get();
		const unsubscribeFn = this.reduxStore.subscribe( () => {
			if ( ! isEqual( this.currentValue, this.get() ) ) {
				this.currentValue = this.get();
				callback( this.currentValue );
			}
		} );
		this.subscribers.set( callback, unsubscribeFn );
	},
	unsubscribe( callback ) {
		if ( this.subscribers.has( callback ) ) {
			// NOTE: Executing the function stored at this key unsubscribes the listener
			this.subscribers.get( callback )();
			this.subscribers.delete( callback );
		}
	},
	unsubscribeAll() {
		[ ...this.subscribers.keys() ].forEach( key => this.unsubscribe( key ) );
	},
};

function addStorableDependencies( step, action ) {
	const unstorableDependencies = get( steps, [ step.stepName, 'unstorableDependencies' ] );

	if ( isEmpty( action.providedDependencies ) ) {
		return step;
	}

	const providedDependencies = omit( action.providedDependencies, unstorableDependencies );

	return { ...step, providedDependencies };
}

/**
 * Compatibility layer
 */
SignupProgressStore.dispatchToken = Dispatcher.register( function( payload ) {
	const { action } = payload;
	const currentFlowName = getCurrentFlowName( SignupProgressStore.reduxStore.getState() );
	const step = { ...action.data, lastUpdated: Date.now() };

	Dispatcher.waitFor( [ SignupDependencyStore.dispatchToken ] );

	if ( ! isEmpty( action.errors ) ) {
		SignupProgressStore.reduxStore.dispatch( invalidateStep( step, action.errors ) );
		return;
	}

	debug( `Handling ${ action.type }` );
	switch ( action.type ) {
		case 'SAVE_SIGNUP_STEP':
			SignupProgressStore.reduxStore.dispatch(
				saveStep(
					addStorableDependencies(
						{
							...step,
							lastKnownFlow: currentFlowName,
						},
						action
					)
				)
			);
			break;
		case 'SUBMIT_SIGNUP_STEP':
			SignupProgressStore.reduxStore.dispatch(
				submitStep(
					addStorableDependencies(
						{
							...step,
							lastKnownFlow: currentFlowName,
						},
						action
					)
				)
			);
			break;
		case 'PROCESS_SIGNUP_STEP':
			SignupProgressStore.reduxStore.dispatch(
				processStep( addStorableDependencies( step, action ) )
			);
			break;
		case 'PROCESSED_SIGNUP_STEP':
			SignupProgressStore.reduxStore.dispatch(
				completeStep( addStorableDependencies( step, action ) )
			);
			break;
		case 'CHANGE_SIGNUP_FLOW':
			SignupProgressStore.reduxStore.dispatch( removeUnneededSteps( action.flowName ) );
			break;
	}
} );

export default SignupProgressStore;
