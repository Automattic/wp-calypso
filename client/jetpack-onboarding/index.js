/** @format */
/**
 * External dependencies
 */
import page from 'page';
import config from 'config';
import { values } from 'lodash';

const { isEnabled } = config;

/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS } from './constants';
import { onboarding } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	if ( isEnabled( 'jetpack/onboarding' ) ) {
		const validStepNames = values( JETPACK_ONBOARDING_STEPS );
		page(
			`/jetpack/onboarding/:stepName(${ validStepNames.join( '|' ) })?/:site`,
			onboarding,
			makeLayout,
			clientRender
		);
	}
}
