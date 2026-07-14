import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { agencySiteRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { getDisplayUrl, getSiteName } from '../dataviews/site-data';
import ActivityCard from './activity-card';
import BackupCard from './backup-card';
import ScanCard from './scan-card';

export default function AgencySiteOverview() {
	const { siteSlug } = agencySiteRoute.useParams();
	const site = agencySiteRoute.useLoaderData();
	const isSmallViewport = useViewportMatch( 'medium', '<' );

	return (
		<PageLayout
			header={ <PageHeader title={ getSiteName( site ) } description={ getDisplayUrl( site ) } /> }
		>
			<Grid columns={ isSmallViewport ? 1 : 2 } gap={ isSmallViewport ? 4 : 6 }>
				<BackupCard site={ site } />
				<ScanCard site={ site } siteSlug={ siteSlug } />
			</Grid>
			<ActivityCard />
		</PageLayout>
	);
}
