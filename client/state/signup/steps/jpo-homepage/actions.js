/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_JPO_HOMEPAGE_SET } from 'state/action-types';

export function setJPOHomepage( homepage ) {
	console.log( 'setJPOHomepage: ', homepage );

	return {
		type: SIGNUP_STEPS_JPO_HOMEPAGE_SET,
		homepage
	};
}