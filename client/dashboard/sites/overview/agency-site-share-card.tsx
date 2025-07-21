import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { link } from '@wordpress/icons';
import { sitePreviewLinksQuery } from '../../app/queries/site-preview-links';
import { OverviewCardWithLink } from '../overview-card';
import { OverviewCardRouterLinkIcon } from '../overview-card/link';
import OverviewCardSummary from '../overview-card/summary';
import type { Site } from '../../data/types';

const TRACKS_ID = 'agency-site-share';

export default function AgencySiteShareCard( { site }: { site: Site } ) {
	const { data: links = [] } = useQuery( sitePreviewLinksQuery( site.ID ) );
	const heading = links.length > 0 ? __( 'Preview link enabled' ) : __( 'Share a preview link' );

	return (
		<OverviewCardWithLink
			link={ `/sites/${ site.slug }/settings/site-visibility` }
			tracksId={ TRACKS_ID }
			variant="upsell"
		>
			<OverviewCardSummary
				icon={ link }
				heading={ heading }
				description={ __( 'Collaborators with the link can view your site' ) }
				linkIcon={ <OverviewCardRouterLinkIcon /> }
				title={ __( 'Share' ) }
			/>
		</OverviewCardWithLink>
	);
}
