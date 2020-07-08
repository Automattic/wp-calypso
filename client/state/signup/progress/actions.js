/**
 * External dependencies
 */
import { includes, isEmpty, reduce, snakeCase, toPairs } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_REMOVE_STEP,
} from 'state/action-types';
import { assertValidDependencies } from 'lib/signup/asserts';
import { getCurrentFlowName } from 'state/signup/flow/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

import 'state/signup/init';

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
				 *
				 * @see the `sitePreviewImageBlob` dependency
				 */
				propName = 'site_preview_image_fetched';
				propValue = !! propValue;
			}

			// Ensure we don't capture identifiable user data we don't need.
			if ( includes( [ 'email' ], propName ) ) {
				propName = `user_entered_${ propName }`;
				propValue = !! propValue;
			}

			if (
				( propName === 'cart_item' || propName === 'domain_item' ) &&
				typeof propValue !== 'string'
			) {
				propValue = toPairs( propValue )
					.map( ( pair ) => pair.join( ':' ) )
					.join( ',' );
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
	return ( dispatch, getState ) => {
		const lastKnownFlow = getCurrentFlowName( getState() );
		const lastUpdated = Date.now();

		dispatch( {
			type: SIGNUP_PROGRESS_SAVE_STEP,
			step: { ...step, lastKnownFlow, lastUpdated },
		} );
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
	const lastUpdated = Date.now();
	return {
		type: SIGNUP_PROGRESS_COMPLETE_STEP,
		step: addProvidedDependencies( { ...step, lastUpdated }, providedDependencies ),
	};
}

export function processStep( step ) {
	const lastUpdated = Date.now();
	return {
		type: SIGNUP_PROGRESS_PROCESS_STEP,
		step: { ...step, lastUpdated },
	};
}

export function invalidateStep( step, errors ) {
	const lastUpdated = Date.now();
	return {
		type: SIGNUP_PROGRESS_INVALIDATE_STEP,
		step: { ...step, lastUpdated },
		errors,
	};
}

export function removeStep( step ) {
	return {
		type: SIGNUP_PROGRESS_REMOVE_STEP,
		step,
	};
}
