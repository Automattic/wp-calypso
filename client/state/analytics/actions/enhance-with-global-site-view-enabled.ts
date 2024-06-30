import { set } from 'lodash';
import { ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import { isAdminInterfaceWPAdmin } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';
import type { AnyAction } from 'redux';

/**
 * Enhances any Redux action that denotes the recording of an analytics event with
 * an additional property `global_site_view_enabled` which specifies whether the user has
 * the nav redesign global site view enabled.
 * @param {Object} action - Redux action as a plain object
 * @param {Function} getState - Redux function that can be used to retrieve the current state tree
 * @returns {import('redux').AnyAction} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export function enhanceWithGlobalSiteViewEnabled( action: AnyAction, getState: () => AppState ) {
	const siteId = getSelectedSiteId( getState() );

	const isNewNavEnabled = isAdminInterfaceWPAdmin( getState(), siteId );

	const enabledValue = isNewNavEnabled ? '1' : '0';

	if ( action.type === ANALYTICS_EVENT_RECORD ) {
		set( action, 'meta.analytics[0].payload.properties.global_site_view_enabled', enabledValue );
	} else {
		set( action, 'meta.analytics[0].payload.global_site_view_enabled', enabledValue );
	}

	return action;
}
