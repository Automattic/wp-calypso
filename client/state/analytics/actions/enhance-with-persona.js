import { set } from 'lodash';
import { ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

/**
 * Enhances any Redux action that denotes the recording of an analytics event with an additional property which
 * specifies the type of user.
 * @param {Object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {import('redux').AnyAction} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export function enhanceWithPersona( action, getState ) {
	const isDevAccount = getUserSetting( getState(), 'is_dev_account' );
	const userType = isDevAccount ? 'dev' : 'general';

	if ( action.type === ANALYTICS_EVENT_RECORD ) {
		set( action, 'meta.analytics[0].payload.properties.persona', userType );
	} else {
		set( action, 'meta.analytics[0].payload.persona', userType );
	}

	return action;
}
