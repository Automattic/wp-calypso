import config from '@automattic/calypso-config';
import { set } from 'lodash';
import { ANALYTICS_EVENT_RECORD, ANALYTICS_PAGE_VIEW_RECORD } from 'calypso/state/action-types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Enhances any Redux action that denotes the recording of an analytics event with an additional property if
 * the site is running as an Odyssey application (i.e., Calypso-in-Jetpack application).
 *
 * @param {Object} action - Redux action as a plain object
 * @returns {import('redux').AnyAction} the new Redux action
 * @see client/state/utils/withEnhancers
 */
export function enhanceWithOdysseyFlag( action, getState ) {
	const isOdyssey = config.isEnabled( 'is_running_in_jetpack_site' );

	if ( action.type === ANALYTICS_EVENT_RECORD || action.type === ANALYTICS_PAGE_VIEW_RECORD ) {
		if ( isOdyssey ) {
			set( action, 'meta.analytics[0].payload.blog_id', getSelectedSiteId( getState() ) );
			set( action, 'meta.analytics[0].payload.is_odyssey', true );
		}
	}

	return action;
}
