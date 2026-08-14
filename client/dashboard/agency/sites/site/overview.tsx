import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { agencySiteRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import PerformanceCard from '../../../sites/overview-performance-card';
import { getDisplayUrl, getSiteName } from '../dataviews/site-data';
import ActivityCard from './activity-card';
import BackupCard from './backup-card';
import ScanCard from './scan-card';

export default function AgencySiteOverview() {
	const { siteSlug } = agencySiteRoute.useParams();
	const site = agencySiteRoute.useLoaderData();
	const { data: fullSite } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const isSmallViewport = useViewportMatch( 'medium', '<' );

	return (
		<PageLayout
			header={ <PageHeader title={ getSiteName( site ) } description={ getDisplayUrl( site ) } /> }
		>
			<Grid columns={ isSmallViewport ? 1 : 2 } gap={ isSmallViewport ? 4 : 6 }>
				<BackupCard site={ site } />
				<ScanCard site={ site } siteSlug={ siteSlug } />
				{ /* TODO (A4A): for private/coming-soon/unlaunched sites this card links to
				     `/sites/$slug/settings/site-visibility`, which has no route in the agency
				     site view yet. Guard the link (or add settings) once A4A settings lands. */ }
				<PerformanceCard site={ fullSite } />
			</Grid>
			<ActivityCard />
		</PageLayout>
	);
}
