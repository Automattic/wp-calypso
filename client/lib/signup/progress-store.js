/** @format */

/**
 * External dependencies
 */

import { cloneDeep, find, get, isEmpty, isEqual, map, omit } from 'lodash';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import steps from 'signup/config/steps';
import { SIGNUP_COMPLETE_RESET, SIGNUP_PROGRESS_UPDATE } from 'state/action-types';
import { getSignupProgress } from 'state/signup/progress/selectors';
import SignupDependencyStore from './dependency-store';

const debug = debugFactory( 'calypso:signup-progress-store' );

const SignupProgressStore = {
	subscribers: new Map(),

	get() {
		return cloneDeep( getSignupProgress( this.reduxStore.getState() ) );
	},
	omitUserData( progress ) {
		return map( progress, step => {
			return omit( step, 'userData' );
		} );
	},
	on( eventName, callback ) {
		if ( eventName === 'change' ) {
			this.subscribe( callback );
		}
	},
	off( ...params ) {
		this.unsubscribe( ...params );
	},
	reset() {
		this.reduxStore.dispatch( {
			type: SIGNUP_COMPLETE_RESET,
		} );
		// Unsubscribe all listeners
		[ ...this.subscribers.keys() ].forEach( key => this.unsubscribe( key ) );
	},
	set( input ) {
		this.reduxStore.dispatch( {
			type: SIGNUP_PROGRESS_UPDATE,
			data: this.omitUserData( input ),
		} );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	},
	subscribe( callback ) {
		this.currentValue = this.get();
		const unsubscribeFn = this.reduxStore.subscribe( () => {
			const previousProgress = this.currentValue;
			this.currentValue = SignupProgressStore.get();
			if ( ! isEqual( previousProgress, this._currentProgress ) ) {
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
};

function updateStep( newStep ) {
	debug( `Updating signup step ${ newStep.stepName }` );
	const signupProgress = map( SignupProgressStore.get(), function( step ) {
		if ( step.stepName === newStep.stepName ) {
			const { status } = newStep;
			if ( status === 'pending' || status === 'completed' ) {
				// Steps that are resubmitted may decide to omit the
				// `processingMessage` or `wasSkipped` status of a step if e.g.
				// the user goes back and chooses to not skip a step. If a step
				// is submitted without these, we explicitly remove them from
				// the step data.
				return { ...omit( step, [ 'processingMessage', 'wasSkipped' ] ), ...newStep };
			}

			return { ...step, ...newStep };
		}

		return step;
	} );

	SignupProgressStore.set( signupProgress );
}

function addStep( step ) {
	debug( `Adding signup step ${ step.stepName }` );
	SignupProgressStore.set( SignupProgressStore.get().concat( step ) );
}

function updateOrAddStep( step ) {
	if ( find( SignupProgressStore.get(), { stepName: step.stepName } ) ) {
		updateStep( step );
	} else {
		addStep( step );
	}
}

function setStepInvalid( step, errors ) {
	updateOrAddStep( { ...step, status: 'invalid', errors } );
}

function saveStep( step ) {
	debug( `Saving signup step ${ step.stepName }` );
	if ( find( SignupProgressStore.get(), { stepName: step.stepName } ) ) {
		updateStep( step );
	} else {
		addStep( { ...step, status: 'in-progress' } );
	}
}

function submitStep( step ) {
	debug( `Submitting signup step ${ step.stepName }` );
	const stepHasApiRequestFunction =
			steps[ step.stepName ] && steps[ step.stepName ].apiRequestFunction,
		status = stepHasApiRequestFunction ? 'pending' : 'completed';

	updateOrAddStep( { ...step, status } );
}

function processStep( step ) {
	debug( `Processing signup step ${ step.stepName }` );
	updateStep( { ...step, status: 'processing' } );
}

function completeStep( step ) {
	debug( `Completed signup step ${ step.stepName }` );
	updateStep( { ...step, status: 'completed' } );
}

function addTimestamp( step ) {
	return { ...step, lastUpdated: Date.now() };
}

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
	const step = addTimestamp( action.data );

	Dispatcher.waitFor( [ SignupDependencyStore.dispatchToken ] );

	if ( ! isEmpty( action.errors ) ) {
		return setStepInvalid( step, action.errors );
	}

	debug( `Handling ${ action.type }` );
	switch ( action.type ) {
		case 'SAVE_SIGNUP_STEP':
			saveStep( addStorableDependencies( step, action ) );
			break;
		case 'SUBMIT_SIGNUP_STEP':
			submitStep( addStorableDependencies( step, action ) );
			break;
		case 'PROCESS_SIGNUP_STEP':
			processStep( addStorableDependencies( step, action ) );
			break;
		case 'PROCESSED_SIGNUP_STEP':
			completeStep( addStorableDependencies( step, action ) );
			break;
	}
} );

export default SignupProgressStore;
