/* global helpCenterData */
import { NO_SITE_CONTEXT, recordTracksEvent, withSiteContext } from '@automattic/calypso-analytics';

export function recordHostTracksEvent( eventName, properties = {} ) {
	recordTracksEvent(
		eventName,
		withSiteContext(
			properties,
			'help_center_data',
			typeof helpCenterData !== 'undefined' ? helpCenterData?.site?.ID : undefined
		)
	);
}

export function recordDisconnectedHostTracksEvent( eventName, properties = {} ) {
	recordTracksEvent( eventName, withSiteContext( properties, NO_SITE_CONTEXT ) );
}
