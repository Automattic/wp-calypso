import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalDivider as Divider,
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteEngagementStatsQuery } from '../../app/queries/site-stats';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getSiteDisplayName } from '../../utils/site-name';
import CommentsCard from './comments-card';
import LikesCard from './likes-card';
import PerformanceCards from './performance-cards';
import SiteOverviewFields from './site-overview-fields';
import SitePreviewCard from './site-preview-card';
import StorageCard from './storage-card';
import SubscribersCard from './subscribers-card';
import UptimeCard from './uptime-card';
import ViewsCard from './views-card';
import VisitorsCard from './visitors-card';
import './style.scss';

function SiteOverview() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: engagementStats } = useQuery( siteEngagementStatsQuery( site.ID ) );

	if ( ! engagementStats ) {
		return;
	}
	return (
		<PageLayout
			header={
				<PageHeader
					title={ getSiteDisplayName( site ) }
					description={ <SiteOverviewFields site={ site } /> }
					actions={
						site.options?.admin_url && (
							<Button
								__next40pxDefaultSize
								variant="primary"
								href={ site.options.admin_url }
								icon={ wordpress }
							>
								{ __( 'WP Admin' ) }
							</Button>
						)
					}
				/>
			}
		>
			<VStack alignment="stretch" spacing={ 10 }>
				<Grid columns={ 4 } rows={ 1 } gap={ 6 }>
					<SitePreviewCard site={ site } />
					<VStack className="site-overview-cards" spacing={ 6 }>
						<VisitorsCard engagementStats={ engagementStats } />
						<ViewsCard engagementStats={ engagementStats } />
					</VStack>
					<VStack className="site-overview-cards" spacing={ 6 }>
						<LikesCard engagementStats={ engagementStats } />
						<CommentsCard engagementStats={ engagementStats } />
					</VStack>
					<SubscribersCard subscribers={ site.subscribers_count } />
				</Grid>
				<Divider orientation="horizontal" style={ { width: '100%', color: '#f0f0f0' } } />
				<HStack className="site-overview-cards" spacing={ 6 } alignment="flex-start">
					<VStack spacing={ 6 } justify="start">
						<PerformanceCards site={ site } />
					</VStack>
					<VStack spacing={ 6 } justify="start">
						<StorageCard site={ site } />
						<UptimeCard site={ site } />
					</VStack>
				</HStack>
			</VStack>
		</PageLayout>
	);
}

export default SiteOverview;
