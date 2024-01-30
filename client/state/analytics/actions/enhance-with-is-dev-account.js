import { set } from 'lodash';
import { ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

/**
 * Enhances any Redux action that denotes the recording of an analytics event with an additional property which
 * specifies whether or not the user has the `is_dev_account` setting ("I am a developer") enabled.
 * @param {Object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {import('redux').AnyAction} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export function enhanceWithIsDevAccount( action, getState ) {
	const isDevAccount = getUserSetting( getState(), 'is_dev_account' );
	console.log( 'getState()', getState() );
	console.log( 'isDevAccount', isDevAccount );
	const isDevAccountValue = isDevAccount ? '1' : '0';

	if ( action.type === ANALYTICS_EVENT_RECORD ) {
		set( action, 'meta.analytics[0].payload.properties.is_dev_account', isDevAccountValue );
	} else {
		set( action, 'meta.analytics[0].payload.is_dev_account', isDevAccountValue );
	}

	return action;
}
