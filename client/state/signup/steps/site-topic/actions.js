/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_SITE_TOPIC_SET } from 'state/action-types';

export const setSiteTopic = siteTopic => ( {
	type: SIGNUP_STEPS_SITE_TOPIC_SET,
	siteTopic,
} );
