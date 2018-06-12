/** @format */

/**
 * External dependencies
 */

import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import analytics from 'lib/analytics';

const SignupActions = {
	fetchCachedSignup() {
		Dispatcher.handleViewAction( { type: 'FETCH_CACHED_SIGNUP' } );
	},

	saveSignupStep( step ) {
		// there are some conditions in which a step could be saved/processed in the same event loop
		// so we should defer the action
		defer( () => {
			Dispatcher.handleViewAction( {
				type: 'SAVE_SIGNUP_STEP',
				data: step,
			} );
		} );
	},

	submitSignupStep( step, providedDependencies ) {
		analytics.tracks.recordEvent( 'calypso_signup_actions_submit_step', { step: step.stepName } );

		Dispatcher.handleViewAction( {
			type: 'SUBMIT_SIGNUP_STEP',
			data: step,
			providedDependencies: providedDependencies,
		} );
	},

	processSignupStep( step, errors, providedDependencies ) {
		// deferred because a step can be processed as soon as it is submitted
		defer( () => {
			Dispatcher.handleViewAction( {
				type: 'PROCESS_SIGNUP_STEP',
				data: step,
				errors: undefined === errors ? [] : errors,
				providedDependencies: providedDependencies,
			} );
		} );
	},

	processedSignupStep( step, errors, providedDependencies ) {
		analytics.tracks.recordEvent( 'calypso_signup_actions_complete_step', { step: step.stepName } );

		Dispatcher.handleViewAction( {
			type: 'PROCESSED_SIGNUP_STEP',
			data: step,
			errors: undefined === errors ? [] : errors,
			providedDependencies: providedDependencies,
		} );
	},

	/**
	 * Action for providing dependencies not associated with a step.
	 *
	 * @param {object} providedDependencies - Object containing dependencies
	 */
	provideDependencies( providedDependencies ) {
		Dispatcher.handleViewAction( {
			type: 'PROVIDE_SIGNUP_DEPENDENCIES',
			providedDependencies,
		} );
	},
};

export default SignupActions;
