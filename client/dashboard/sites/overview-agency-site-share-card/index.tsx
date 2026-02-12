import { sitePreviewLinksQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { link } from '@wordpress/icons';
import OverviewCard from '../../components/overview-card';
import { getSiteVisibilityURL } from '../../utils/site-url';
import type { Site } from '@automattic/api-core';

export default function AgencySiteShareCard( { site }: { site: Site } ) {
	const { data: links = [] } = useQuery( sitePreviewLinksQuery( site.ID ) );
	const heading = links.length > 0 ? __( 'Preview link enabled' ) : __( 'Share a preview link' );

	return (
		<OverviewCard
			icon={ link }
			heading={ heading }
			description={ __( 'Collaborators with the link can view your site.' ) }
			link={ getSiteVisibilityURL( site, { back_to: 'site-overview' } ) }
			title={ __( 'Share' ) }
			tracksId="site-overview-agency-site-share"
		/>
	);
}
