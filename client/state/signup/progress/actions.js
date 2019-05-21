/**
 * External dependencies
 */
import { includes, isEmpty, reduce, snakeCase } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
} from 'state/action-types';
import { assertValidDependencies } from 'lib/signup/asserts';
import { getCurrentFlowName } from 'state/signup/flow/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

function addProvidedDependencies( step, providedDependencies ) {
	if ( isEmpty( providedDependencies ) ) {
		return step;
	}

	return { ...step, providedDependencies };
}

function recordSubmitStep( stepName, providedDependencies ) {
	// Transform the keys since tracks events only accept snaked prop names.
	// And anonymize personally identifiable information.
	const inputs = reduce(
		providedDependencies,
		( props, propValue, propName ) => {
			propName = snakeCase( propName );

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
		},
		{}
	);

	return recordTracksEvent( 'calypso_signup_actions_submit_step', {
		step: stepName,
		...inputs,
	} );
}

export function saveSignupStep( step ) {
	return {
		type: SIGNUP_PROGRESS_SAVE_STEP,
		step,
	};
}

export function submitSignupStep( step, providedDependencies ) {
	assertValidDependencies( step.stepName, providedDependencies );
	return ( dispatch, getState ) => {
		const lastKnownFlow = getCurrentFlowName( getState() );
		const lastUpdated = Date.now();

		dispatch( recordSubmitStep( step.stepName, providedDependencies ) );

		dispatch( {
			type: SIGNUP_PROGRESS_SUBMIT_STEP,
			step: addProvidedDependencies(
				{ ...step, lastKnownFlow, lastUpdated },
				providedDependencies
			),
		} );
	};
}

export function completeSignupStep( step, providedDependencies ) {
	assertValidDependencies( step.stepName, providedDependencies );
	return ( dispatch, getState ) => {
		const lastKnownFlow = getCurrentFlowName( getState() );
		const lastUpdated = Date.now();

		return dispatch( {
			type: SIGNUP_PROGRESS_COMPLETE_STEP,
			step: addProvidedDependencies(
				{ ...step, lastKnownFlow, lastUpdated },
				providedDependencies
			),
		} );
	};
}

export function processStep( step ) {
	return {
		type: SIGNUP_PROGRESS_PROCESS_STEP,
		step,
	};
}

export function invalidateStep( step, errors ) {
	return {
		type: SIGNUP_PROGRESS_INVALIDATE_STEP,
		step,
		errors,
	};
}

export function removeUnneededSteps( flowName ) {
	return {
		type: SIGNUP_PROGRESS_REMOVE_UNNEEDED_STEPS,
		flowName,
	};
}
