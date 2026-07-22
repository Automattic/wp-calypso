import { agencySiteQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { siteRoute } from '../../../app/router/sites';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import PerformanceCard from '../../../sites/overview-performance-card';
import VisibilityCard from '../../../sites/overview-visibility-card';
import { getDisplayUrl, getSiteName } from '../dataviews/site-data';
import ActivityCard from './activity-card';
import BackupCard from './backup-card';
import ScanCard from './scan-card';

export default function AgencySiteOverview() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( agencySiteQuery( siteSlug ) );
	const { data: fullSite } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const isSmallViewport = useViewportMatch( 'medium', '<' );

	if ( ! site ) {
		return null;
	}

	return (
		<PageLayout
			header={ <PageHeader title={ getSiteName( site ) } description={ getDisplayUrl( site ) } /> }
		>
			<Grid columns={ isSmallViewport ? 1 : 2 } gap={ isSmallViewport ? 4 : 6 }>
				{ ! fullSite.is_wpcom_flex && <VisibilityCard site={ fullSite } /> }
				<BackupCard site={ site } />
				<ScanCard site={ site } siteSlug={ siteSlug } />
				<PerformanceCard site={ fullSite } />
			</Grid>
			<ActivityCard />
		</PageLayout>
	);
}
