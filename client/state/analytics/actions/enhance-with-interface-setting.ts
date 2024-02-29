import { set } from 'lodash';
import { ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

/**
 * Enhances any Redux action that denotes the recording of an analytics event with
 * an additional property `interface_setting` which specifies whether the user has
 * the 'classic' or 'default' interface setting enabled.
 * @param {Object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {import('redux').AnyAction} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export function enhanceWithInterfaceSetting( action: AnyAction, getState: () => AppState ) {
	const siteId = getSelectedSiteId( getState() );
	const interfaceSetting = getSiteOption( getState(), siteId, 'wpcom_admin_interface' );

	const interfaceSettingValue = interfaceSetting === 'wp-admin' ? 'classic' : 'default';

	if ( action.type === ANALYTICS_EVENT_RECORD ) {
		set( action, 'meta.analytics[0].payload.properties.interface_setting', interfaceSettingValue );
	} else {
		set( action, 'meta.analytics[0].payload.interface_setting', interfaceSettingValue );
	}

	return action;
}
