/** @format */

/**
 * Internal dependencies
 */
import { SIGNUP_COMPLETE_RESET, SIGNUP_STEPS_SITE_TOPIC_SET } from 'state/action-types';
import { createReducer } from 'state/utils';
import siteTopicSchema from './schema';

export default createReducer(
	null,
	{
		[ SIGNUP_STEPS_SITE_TOPIC_SET ]: ( state, action ) => action.siteTopic,
		[ SIGNUP_COMPLETE_RESET ]: () => null,
	},
	siteTopicSchema
);
