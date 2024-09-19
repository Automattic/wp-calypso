import { set } from 'lodash';
import { ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

/**
 * Enhances any Redux action that denotes the recording of an analytics event with
 * an additional property `user_is_dev_account` which specifies whether the user has
 * the `is_dev_account` setting ("I am a developer") enabled.
 * @param {Object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {import('redux').AnyAction} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export function enhanceWithUserIsDevAccount( action: AnyAction, getState: () => AppState ) {
	const isDevAccount = getUserSetting( getState(), 'is_dev_account' );

	if ( isDevAccount === null ) {
		return action;
	}

	const isDevAccountValue = isDevAccount ? '1' : '0';

	if ( action.type === ANALYTICS_EVENT_RECORD ) {
		set( action, 'meta.analytics[0].payload.properties.user_is_dev_account', isDevAccountValue );
	} else {
		set( action, 'meta.analytics[0].payload.user_is_dev_account', isDevAccountValue );
	}

	return action;
}
