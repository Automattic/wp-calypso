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
	SIGNUP_PROGRESS_ADD_STEP,
} from 'calypso/state/action-types';
import { assertValidDependencies } from 'calypso/lib/signup/asserts';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import 'calypso/state/signup/init';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport/src';

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
				[ 'cart_item', 'domain_item', 'selected_domain_upsell_item' ].includes( propName ) &&
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

	const device = resolveDeviceTypeByViewPort();
	return recordTracksEvent( 'calypso_signup_actions_submit_step', {
		device,
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

export function addStep( step ) {
	return {
		type: SIGNUP_PROGRESS_ADD_STEP,
		step: { ...step },
	};
}
