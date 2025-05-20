import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ExternalLink,
	Button,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import {
	siteQuery,
	siteMonitorUptimeQuery,
	sitePHPVersionQuery,
	siteCurrentPlanQuery,
	sitePrimaryDomainQuery,
	siteEngagementStatsQuery,
} from '../../app/queries';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import CommentsCard from './comments-card';
import LikesCard from './likes-card';
import OverviewSection from './overview-section';
import PerformanceCards from './performance-cards';
import Sidebar from './sidebar';
import StorageCard from './storage-card';
import SubscribersCard from './subscribers-card';
import UptimeCard from './uptime-card';
import ViewsCard from './views-card';
import VisitorsCard from './visitors-card';

import './style.scss';

function SiteOverview() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: siteMonitorUptime } = useQuery( {
		...siteMonitorUptimeQuery( siteSlug ),
		enabled: site?.jetpack && site?.jetpack_modules.includes( 'monitor' ),
	} );
	const { data: phpVersion } = useQuery( {
		...sitePHPVersionQuery( siteSlug ),
		enabled: site?.is_wpcom_atomic,
	} );
	const { data: currentPlan } = useQuery( siteCurrentPlanQuery( siteSlug ) );
	const { data: primaryDomain } = useQuery( sitePrimaryDomainQuery( siteSlug ) );
	const { data: engagementStats } = useQuery( siteEngagementStatsQuery( siteSlug ) );

	if ( ! site || ! currentPlan || ! primaryDomain || ! engagementStats ) {
		return;
	}
	return (
		<PageLayout
			header={
				<PageHeader
					title={ site.name }
					actions={
						<>
							<ExternalLink href={ site.URL }>{ __( 'Visit' ) }</ExternalLink>
							{ site.options?.admin_url && (
								<Button
									__next40pxDefaultSize
									variant="primary"
									href={ site.options.admin_url }
									icon={ wordpress }
								>
									{ __( 'WP Admin' ) }
								</Button>
							) }
						</>
					}
				/>
			}
		>
			<HStack alignment="flex-start" spacing={ 8 }>
				<Sidebar
					site={ site }
					phpVersion={ phpVersion }
					primaryDomain={ primaryDomain }
					currentPlan={ currentPlan }
				/>
				<VStack spacing={ 8 }>
					<Card style={ { padding: '16px' } }>
						<VStack>
							<Text>
								{ __(
									'Your site is secure with excellent desktop performance and growing subscribers; now focus on boosting mobile speed and investigating recent drops in views and likes.'
								) }
							</Text>
							<Text variant="muted">{ __( 'WordPress with AI' ) }</Text>
						</VStack>
					</Card>
					<OverviewSection title={ __( 'Engagement' ) } actions={ [] }>
						<VisitorsCard engagementStats={ engagementStats } />
						<ViewsCard engagementStats={ engagementStats } />
						<LikesCard engagementStats={ engagementStats } />
						<CommentsCard engagementStats={ engagementStats } />
						<SubscribersCard subscribers={ site.subscribers_count } />
					</OverviewSection>
					<OverviewSection title={ __( 'Site health' ) } actions={ [] }>
						<PerformanceCards site={ site } />
						<UptimeCard siteMonitorUptime={ siteMonitorUptime } />
						<StorageCard siteSlug={ siteSlug } />
					</OverviewSection>
				</VStack>
			</HStack>
		</PageLayout>
	);
}

export default SiteOverview;
