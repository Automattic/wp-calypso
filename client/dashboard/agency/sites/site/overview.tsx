import { activeAgencyQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useViewportMatch } from '@wordpress/compose';
import { agencySiteRoute } from '../../../app/router/agency';
import Grid from '../../../components/grid';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import PerformanceCard from '../../../sites/overview-performance-card';
import SiteOverviewFields from '../../../sites/overview-site-fields';
import VisibilityCard from '../../../sites/overview-visibility-card';
import { siteTypeSupportsFeature } from '../../../utils/site-type-feature-support';
import { getSiteName } from '../dataviews/site-data';
import { isTeamMemberWithoutSiteAccess } from './access';
import ActivityCard from './activity-card';
import BackupCard from './backup-card';
import AgencySiteHeaderActions from './header-actions';
import NoAccessCallout from './no-access-callout';
import AgencySitePlanCard from './plan-card';
import ScanCard from './scan-card';

// Mirrors the WordPress.com site overview: the tall plan card sits beside
// columns of two shorter cards, so it doesn't stretch its row neighbor.
function getGridLayout( {
	isLargeViewport,
	isSmallViewport,
}: {
	isLargeViewport: boolean;
	isSmallViewport: boolean;
} ) {
	if ( isLargeViewport ) {
		return { columns: 3, rows: 1 };
	}
	if ( isSmallViewport ) {
		return { columns: 1, rows: 3 };
	}
	return { columns: 2, rows: 2 };
}

export default function AgencySiteOverview() {
	const { siteSlug } = agencySiteRoute.useParams();
	const site = agencySiteRoute.useLoaderData();
	const { data: fullSite } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: agency } = useSuspenseQuery( activeAgencyQuery() );
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const isLargeViewport = useViewportMatch( 'xlarge' );
	const gap = isSmallViewport ? 'lg' : 'xl';
	const gridLayout = getGridLayout( { isLargeViewport, isSmallViewport } );

	if ( isTeamMemberWithoutSiteAccess( fullSite, agency ) ) {
		return (
			<PageLayout header={ <PageHeader title={ getSiteName( site ) } /> }>
				<NoAccessCallout />
			</PageLayout>
		);
	}

	return (
		<PageLayout
			header={
				<PageHeader
					title={ getSiteName( site ) }
					description={ <SiteOverviewFields site={ fullSite } /> }
					actions={ <AgencySiteHeaderActions site={ site } fullSite={ fullSite } /> }
				/>
			}
		>
			<Grid { ...gridLayout } gap={ gap }>
				<AgencySitePlanCard agencySite={ site } site={ fullSite } />
				<Grid columns={ 1 } rows={ 2 } gap={ gap }>
					<VisibilityCard site={ fullSite } />
					<BackupCard site={ site } />
				</Grid>
				<Grid columns={ 1 } rows={ 2 } gap={ gap }>
					{ siteTypeSupportsFeature( fullSite, 'performance' ) && (
						<PerformanceCard site={ fullSite } />
					) }
					<ScanCard site={ site } siteSlug={ siteSlug } />
				</Grid>
			</Grid>
			<ActivityCard />
		</PageLayout>
	);
}
