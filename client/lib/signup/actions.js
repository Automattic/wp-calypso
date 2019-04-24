/** @format */

/**
 * External dependencies
 */

import { defer, includes, keys, snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import analytics from 'lib/analytics';

const SignupActions = {
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
		const { stepName } = step;

		// Transform the keys since tracks events only accept snaked prop names.
		const inputs = keys( providedDependencies ).reduce( ( props, name ) => {
			let propName = snakeCase( name );
			let propValue = providedDependencies[ name ];

			if ( stepName === 'from-url' && propName === 'site_preview_image_blob' ) {
				/**
				 * There's no need to include a resource ID in our event.
				 * Just record that a preview was fetched
				 * @see the `sitePreviewImageBlob` dependency
				 */
				propName = 'site_preview_image_fetched';
				propValue = !! propValue;
			}

			// Ensure we don't capture identifiable user data we don't need.
			if ( includes( [ 'email', 'address', 'phone' ], propName ) ) {
				propName = `user_entered_${ propName }`;
				propValue = !! propValue;
			}

			return {
				...props,
				[ propName ]: propValue,
			};
		}, {} );

		analytics.tracks.recordEvent( 'calypso_signup_actions_submit_step', {
			step: stepName,
			...inputs,
		} );

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

	changeSignupFlow( flowName ) {
		Dispatcher.handleViewAction( {
			type: 'CHANGE_SIGNUP_FLOW',
			flowName,
		} );
	},
};

export default SignupActions;
