/** @format */
/**
 * External dependencies
 */
import page from 'page';
import { isEnabled } from 'config';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import { onboarding } from './controller';
import { JETPACK_ONBOARDING_STEPS } from './constants';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( isEnabled( 'jetpack/onboarding' ) ) {
		const validStepNames = values( JETPACK_ONBOARDING_STEPS );
		page(
			`/jetpack/onboarding/:stepName(${ validStepNames.join( '|' ) })?`,
			onboarding,
			makeLayout,
			clientRender
		);
	}
}
