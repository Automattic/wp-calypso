import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import { reduce, snakeCase } from 'lodash';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ProvidedDependencies } from '../types';

export function recordSubmitStep(
	providedDependencies: ProvidedDependencies = {},
	intent: string,
	flow: string,
	step: string,
	variant?: string,
	additionalProps: ProvidedDependencies = {}
) {
	const device = resolveDeviceTypeByViewPort();
	const inputs = reduce(
		providedDependencies,
		( props, propValue, propName: string ) => {
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

	recordTracksEvent( 'calypso_signup_actions_submit_step', {
		device,
		flow,
		variant,
		step,
		intent,
		...inputs,
		...additionalInputs,
	} );
}
