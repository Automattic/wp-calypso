import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { reduce, snakeCase } from 'lodash';
import { STEPPER_TRACKS_EVENTS_STEP_NAV } from 'calypso/landing/stepper/constants';
import { getStepOldSlug } from 'calypso/landing/stepper/declarative-flow/helpers/get-step-old-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ProvidedDependencies } from '../types';

export interface RecordStepNavigationParams {
	event: ( typeof STEPPER_TRACKS_EVENTS_STEP_NAV )[ number ];
	intent: string;
	flow: string;
	step: string;
	variant?: string;
	providedDependencies?: ProvidedDependencies;
	additionalProps?: ProvidedDependencies;
}

// These properties are never recorded in the tracks event for security reasons.
const EXCLUDED_DEPENDENCIES = [
	'bearer_token',
	'token',
	'password',
	'password_confirm',
	'domainCart',
	'domainForm',
	'suggestion',
];

export function recordStepNavigation( {
	event,
	intent,
	flow,
	step,
	variant,
	providedDependencies = {},
	additionalProps = {},
}: RecordStepNavigationParams ) {
	const device = resolveDeviceTypeByViewPort();
	const inputs = reduce(
		providedDependencies,
		( props, propValue, propName: string ) => {
			if ( EXCLUDED_DEPENDENCIES.includes( propName ) ) {
				return props;
			}
			propName = snakeCase( propName );

			// Ensure we don't capture identifiable user data we don't need.
			if ( propName === 'email' ) {
				propName = `user_entered_${ propName }`;
				propValue = !! propValue;
			}

			if ( propName === 'selected_design' ) {
				propValue = ( propValue as { slug: string } ).slug;
			}

			if ( propName === 'current_plan' ) {
				propValue = ( propValue as { product_slug: string } ).product_slug;
			}

			if ( propName === 'plan' ) {
				// propValue is null when user selects a free plan
				propValue = ( propValue as { product_slug: string } | null )?.product_slug;
			}

			if (
				[ 'cart_items', 'domain_item', 'email_item', 'domain_cart' ].includes( propName ) &&
				typeof propValue !== 'string'
			) {
				propValue = Object.entries( propValue || {} )
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

	const additionalInputs = reduce(
		additionalProps,
		( props, propValue, propName: string ) => {
			propName = snakeCase( propName );

			return {
				...props,
				[ propName ]: propValue,
			};
		},
		{}
	);

	recordTracksEvent( event, {
		device,
		flow,
		variant,
		step,
		intent,
		...inputs,
		...additionalInputs,
	} );

	const stepOldSlug = getStepOldSlug( step );
	if ( stepOldSlug ) {
		recordTracksEvent( event, {
			device,
			flow,
			variant,
			step: stepOldSlug,
			intent,
			...inputs,
			...additionalInputs,
		} );
	}
}
