/* global helpCenterData */
import { recordTracksEvent, withSiteContext } from '@automattic/calypso-analytics';

export function recordHostTracksEvent( eventName, properties = {} ) {
	recordTracksEvent(
		eventName,
		withSiteContext( properties, [
			[
				'help_center_data',
				typeof helpCenterData !== 'undefined' ? helpCenterData?.site?.ID : undefined,
			],
		] )
	);
}

export function recordDisconnectedHostTracksEvent( eventName, properties = {} ) {
	recordTracksEvent( eventName, withSiteContext( properties, [] ) );
}
