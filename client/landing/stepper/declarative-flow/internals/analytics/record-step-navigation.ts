import { snakeCase } from '@automattic/js-utils';
import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { STEPPER_TRACKS_EVENTS_STEP_NAV } from 'calypso/landing/stepper/constants';
import { getStepOldSlug } from 'calypso/landing/stepper/declarative-flow/helpers/get-step-old-slug';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ProvidedDependencies, StepperStep } from '../types';

export interface RecordStepNavigationParams {
	event: ( typeof STEPPER_TRACKS_EVENTS_STEP_NAV )[ number ];
	intent: string;
	goals?: string[];
	flow: string;
	step: StepperStep[ 'slug' ];
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

const isPrimitive = ( value: unknown ) =>
	value === null || ( typeof value !== 'object' && typeof value !== 'function' );

// Tracks doesn't support nested properties, so join arrays of primitives and drop any other object.
function toTracksProps( props: Record< string, unknown > ) {
	const droppedProps: string[] = [];
	const tracksProps = Object.entries( props ).reduce(
		( result, [ propName, propValue ] ) => {
			if ( Array.isArray( propValue ) && propValue.every( isPrimitive ) ) {
				propValue = propValue.join( ',' );
			}

			if ( propValue !== null && typeof propValue === 'object' ) {
				droppedProps.push( propName );
				return result;
			}

			return { ...result, [ propName ]: propValue };
		},
		{} as Record< string, unknown >
	);

	if ( droppedProps.length > 0 && process.env.NODE_ENV !== 'production' ) {
		// eslint-disable-next-line no-console
		console.warn(
			'Stepper: These object props were not recorded because Tracks does not support nested properties. Flatten them in recordStepNavigation() to record them:',
			droppedProps.join( ', ' )
		);
	}

	return tracksProps;
}

export function recordStepNavigation( {
	event,
	intent = '',
	goals = [],
	flow,
	step,
	variant,
	providedDependencies = {},
	additionalProps = {},
}: RecordStepNavigationParams ) {
	const device = resolveDeviceTypeByViewPort();
	const inputs = Object.entries( providedDependencies ).reduce(
		( props, [ propName, propValue ] ) => {
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
				[ 'cart_items', 'domain_item', 'domain_cart_item', 'email_item', 'domain_cart' ].includes(
					propName
				) &&
				typeof propValue !== 'string'
			) {
				propValue = Array.isArray( propValue )
					? propValue
							.map( ( item ) => ( item as { product_slug?: string } | null )?.product_slug )
							.filter( Boolean )
							.join( ',' )
					: Object.entries( propValue || {} )
							.map( ( pair ) => pair.join( ':' ) )
							.join( ',' );
			}

			if ( propName === 'site' && propValue && typeof propValue === 'object' ) {
				propName = 'site_id';
				propValue = ( propValue as { ID?: number } ).ID;
			}

			return {
				...props,
				[ propName ]: propValue,
			};
		},
		{}
	);

	const additionalInputs = Object.entries( additionalProps ).reduce(
		( props, [ propName, propValue ] ) => {
			propName = snakeCase( propName );

			return {
				...props,
				[ propName ]: propValue,
			};
		},
		{}
	);

	const eventProps = toTracksProps( {
		device,
		flow,
		variant,
		step,
		intent,
		goals: goals.join( ',' ),
		...inputs,
		...additionalInputs,
	} );

	recordTracksEvent( event, eventProps );

	const stepOldSlug = getStepOldSlug( step );
	if ( stepOldSlug ) {
		recordTracksEvent( event, { ...eventProps, step: stepOldSlug } );
	}
}
