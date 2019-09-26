/**
 * External dependencies
 */
import page from 'page';
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import { JETPACK_ONBOARDING_STEPS } from './constants';
import { onboarding } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	const validStepNames = values( JETPACK_ONBOARDING_STEPS );
	page(
		`/jetpack/start/:stepName(${ validStepNames.join( '|' ) })?/:site`,
		onboarding,
		makeLayout,
		clientRender
	);
}
