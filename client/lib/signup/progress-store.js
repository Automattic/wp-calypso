/** @format */

/**
 * External dependencies
 */

import { assign, clone, find, get, isEmpty, map, omit } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:signup-progress-store' );
import store from 'store';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';
import SignupDependencyStore from './dependency-store';
import steps from 'signup/config/steps';

/**
 * Constants
 */
const STORAGE_KEY = 'signupProgress';

/**
 * Module variables
 */
let signupProgress = [];

const SignupProgressStore = {
	get: function() {
		return clone( signupProgress );
	},
	reset: function() {
		signupProgress = [];
		store.remove( STORAGE_KEY );
	},
	getFromCache: function() {
		loadProgressFromCache();
		return this.get();
	},
};

emitter( SignupProgressStore );

function updateStep( newStep ) {
	signupProgress = map( signupProgress, function( step ) {
		if ( step.stepName === newStep.stepName ) {
			const { status } = newStep;
			if ( status === 'pending' || status === 'completed' ) {
				// Steps that are resubmitted may decide to omit the
				// `processingMessage` or `wasSkipped` status of a step if e.g.
				// the user goes back and chooses to not skip a step. If a step
				// is submitted without these, we explicitly remove them from
				// the step data.
				return assign( {}, omit( step, [ 'processingMessage', 'wasSkipped' ] ), newStep );
			}

			return assign( {}, step, newStep );
		}

		return step;
	} );

	handleChange();
}

function addStep( step ) {
	signupProgress = signupProgress.concat( step );

	handleChange();
}

function updateOrAddStep( step ) {
	if ( find( signupProgress, { stepName: step.stepName } ) ) {
		updateStep( step );
	} else {
		addStep( step );
	}
}

function saveStep( step ) {
	if ( find( signupProgress, { stepName: step.stepName } ) ) {
		updateStep( step );
	} else {
		addStep( assign( {}, step, { status: 'in-progress' } ) );
	}
}

function submitStep( step ) {
	const stepHasApiRequestFunction =
			steps[ step.stepName ] && steps[ step.stepName ].apiRequestFunction,
		status = stepHasApiRequestFunction ? 'pending' : 'completed';

	updateOrAddStep( assign( {}, step, { status } ) );
}

function processStep( step ) {
	updateStep( assign( {}, step, { status: 'processing' } ) );
}

function completeStep( step ) {
	updateStep( assign( {}, step, { status: 'completed' } ) );
}

function addTimestamp( step ) {
	return assign( {}, step, { lastUpdated: Date.now() } );
}

function loadProgressFromCache() {
	const cachedSignupProgress = store.get( STORAGE_KEY );

	if ( ! isEmpty( cachedSignupProgress ) ) {
		signupProgress = cachedSignupProgress;
	}

	handleChange();
}

function omitUserData( progress ) {
	return map( progress, step => {
		return omit( step, 'userData' );
	} );
}

function handleChange() {
	SignupProgressStore.emit( 'change' );

	store.set( STORAGE_KEY, omitUserData( signupProgress ) );
}

function addStorableDependencies( step, action ) {
	const unstorableDependencies = get( steps, [ step.stepName, 'unstorableDependencies' ] );

	if ( isEmpty( action.providedDependencies ) ) {
		return step;
	}

	const providedDependencies = omit( action.providedDependencies, unstorableDependencies );

	return { ...step, providedDependencies };
}

SignupProgressStore.dispatchToken = Dispatcher.register( function( payload ) {
	const action = payload.action;
	const step = addTimestamp( action.data );

	Dispatcher.waitFor( [ SignupDependencyStore.dispatchToken ] );

	switch ( action.type ) {
		case 'FETCH_CACHED_SIGNUP':
			loadProgressFromCache();
			break;
		case 'SAVE_SIGNUP_STEP':
			saveStep( addStorableDependencies( step, action ) );
			break;
		case 'SUBMIT_SIGNUP_STEP':
			debug( 'submit step' );
			submitStep( addStorableDependencies( step, action ) );
			break;
		case 'PROCESS_SIGNUP_STEP':
			processStep( addStorableDependencies( step, action ) );
			break;
		case 'PROCESSED_SIGNUP_STEP':
			debug( 'complete step' );
			completeStep( addStorableDependencies( step, action ) );
			break;
	}
} );

export default SignupProgressStore;
