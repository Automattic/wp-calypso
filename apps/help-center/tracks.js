/* global helpCenterData */
import {
	getValidBlogId,
	NO_SITE_CONTEXT,
	recordTracksEvent,
	withSiteContext,
} from '@automattic/calypso-analytics';

export function recordHostTracksEvent( eventName, properties = {} ) {
	const data = typeof helpCenterData !== 'undefined' ? helpCenterData : undefined;
	const siteId = getValidBlogId( data?.site?.ID );
	const primarySiteId = getValidBlogId( data?.currentUser?.primary_blog );

	recordTracksEvent(
		eventName,
		withSiteContext(
			properties,
			siteId ? 'help_center_data' : 'primary_site',
			siteId ?? primarySiteId
		)
	);
}

export function recordDisconnectedHostTracksEvent( eventName, properties = {} ) {
	recordTracksEvent( eventName, withSiteContext( properties, NO_SITE_CONTEXT ) );
}
