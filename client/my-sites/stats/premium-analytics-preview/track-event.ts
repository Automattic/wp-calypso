import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';

type Surface = 'notice' | 'menu';

/**
 * Record a Tracks event for the new Traffic tab invitation, prefixed by the build we are in.
 *
 * `is_odyssey` rather than `is_running_in_jetpack_site`: that one is false in a Simple site's
 * wp-admin and would file those events under Calypso.
 * @param surface Where the reader met the invitation: the banner, or the modules menu.
 * @param name Event name, without the prefix and surface.
 * @param siteId Site the event is about.
 * @param properties Extra event properties.
 */
export const trackPremiumAnalyticsPreviewEvent = (
	surface: Surface,
	name: string,
	siteId: number | null,
	properties: Record< string, unknown > = {}
) => {
	const prefix = config.isEnabled( 'is_odyssey' ) ? 'jetpack_odyssey' : 'calypso';
	recordTracksEvent( `${ prefix }_stats_premium_analytics_preview_${ surface }_${ name }`, {
		blog_id: siteId,
		...properties,
	} );
};
