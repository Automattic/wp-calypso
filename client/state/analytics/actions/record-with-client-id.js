/**
 * External dependencies
 */
import { set } from 'lodash';

/**
 * Internal dependencies
 */
import { ANALYTICS_EVENT_RECORD } from 'calypso/state/action-types';
import { getCurrentOAuth2ClientId } from 'calypso/state/oauth2-clients/ui/selectors';
import { withEnhancers } from 'calypso/state/utils';
import { recordTracksEvent, recordPageView } from './record';

const enhanceWithClientId = ( action, getState ) => {
	const clientId = getCurrentOAuth2ClientId( getState() );

	if ( clientId ) {
		if ( action.type === ANALYTICS_EVENT_RECORD ) {
			set( action, 'meta.analytics[0].payload.properties.client_id', clientId );
		} else {
			set( action, 'meta.analytics[0].payload.client_id', clientId );
		}
	}

	return action;
};

export const recordTracksEventWithClientId = withEnhancers(
	recordTracksEvent,
	enhanceWithClientId
);
export const recordPageViewWithClientId = withEnhancers( recordPageView, enhanceWithClientId );
