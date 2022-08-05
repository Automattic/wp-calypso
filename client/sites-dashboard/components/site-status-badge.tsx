import { useI18n } from '@wordpress/react-i18n';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import SitesLaunchStatusBadge from './sites-launch-status-badge';

interface SiteStatusBadgeProps {
	site: SiteExcerptData;
	as?: 'span' | typeof SitesLaunchStatusBadge;
	hideLive?: boolean;
}

export const SiteStatusBadge = ( {
	hideLive = false,
	site,
	as: Component = 'span',
}: SiteStatusBadgeProps ) => {
	const { __ } = useI18n();

	const isComingSoon =
		site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );

	let siteStatusLabel = __( 'Public' );

	if ( isComingSoon ) {
		siteStatusLabel = __( 'Coming soon' );
	} else if ( site.is_private ) {
		siteStatusLabel = __( 'Private' );
	} else if ( hideLive ) {
		return null;
	}

	return <Component>{ siteStatusLabel }</Component>;
};
