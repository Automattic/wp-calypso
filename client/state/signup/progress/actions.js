import { isTitanMail, WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { isEmpty, reduce, snakeCase } from 'lodash';
import { assertValidDependencies } from 'calypso/lib/signup/asserts';
import {
	SIGNUP_PROGRESS_SAVE_STEP,
	SIGNUP_PROGRESS_SUBMIT_STEP,
	SIGNUP_PROGRESS_COMPLETE_STEP,
	SIGNUP_PROGRESS_PROCESS_STEP,
	SIGNUP_PROGRESS_INVALIDATE_STEP,
	SIGNUP_PROGRESS_REMOVE_STEP,
	SIGNUP_PROGRESS_ADD_STEP,
} from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';

import 'calypso/state/signup/init';

function addProvidedDependencies( step, providedDependencies ) {
	if ( isEmpty( providedDependencies ) ) {
		return step;
	}

	return { ...step, providedDependencies };
}

// These properties are never recorded in the tracks event for security reasons.
const EXCLUDED_DEPENDENCIES = [
	'bearer_token',
	'token',
	'password',
	'password_confirm',
	'domainCart',
];

function recordSubmitStep( flow, stepName, providedDependencies, optionalProps ) {
	// Transform the keys since tracks events only accept snaked prop names.
	// And anonymize personally identifiable information.
	const inputs = reduce(
		providedDependencies,
		( props, propValue, propName ) => {
			if ( EXCLUDED_DEPENDENCIES.includes( propName ) ) {
				return props;
			}

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
			if ( propName === 'email' ) {
				propName = `user_entered_${ propName }`;
				propValue = !! propValue;
			}
			if ( propName === 'username' ) {
				propName = `user_entered_${ propName }`;
				propValue = !! propValue;
			}

			if ( propName === 'cart_item' && propValue?.product_slug === WPCOM_DIFM_LITE ) {
				const { extra, ...otherProps } = propValue;
				propValue = otherProps;
			}

			if ( propName === 'email_item' && propValue && isTitanMail( propValue ) ) {
				const { extra, quantity, ...otherProps } = propValue;
				propValue = otherProps;
			}

			if ( propName === 'selected_page_titles' && Array.isArray( propValue ) ) {
				propValue = propValue.join( ',' );
			}

			if (
				[ 'cart_items', 'domain_item', 'email_item' ].includes( propName ) &&
				typeof propValue !== 'string'
			) {
				propValue = Object.entries( propValue || {} )
					.map( ( pair ) => pair.join( ':' ) )
					.join( ',' );
			}

			if ( propName === 'selected_design' ) {
				propValue = propValue.slug;
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
		flow,
		step: stepName,
		...optionalProps,
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

export function submitSignupStep( step, providedDependencies, optionalProps ) {
	assertValidDependencies( step.stepName, providedDependencies );
	return ( dispatch, getState ) => {
		const lastKnownFlow = getCurrentFlowName( getState() );
		const lastUpdated = Date.now();
		const { intent } = getSignupDependencyStore( getState() );

		dispatch(
			recordSubmitStep( lastKnownFlow, step.stepName, providedDependencies, {
				intent,
				...optionalProps,
				...( step.wasSkipped && { was_skipped: step.wasSkipped } ),
			} )
		);

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
