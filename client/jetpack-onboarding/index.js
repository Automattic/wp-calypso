/** @format */
/**
 * External dependencies
 */
import page from 'page';
import { isEnabled } from 'config';

/**
 * Internal dependencies
 */
import { onboarding } from './controller';

export default function() {
	if ( isEnabled( 'jetpack/onboarding' ) ) {
		page( '/jetpack/onboarding/:stepName?', onboarding );
	}
}
