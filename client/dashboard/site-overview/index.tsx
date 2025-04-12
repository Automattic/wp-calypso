import { useQuery } from '@tanstack/react-query';
import { useLoaderData } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ExternalLink,
	Button,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { envelope, wordpress } from '@wordpress/icons';
import OverviewCard from '../overview-card';
import PageLayout from '../page-layout';
import CommentsCard from './comments-card';
import LikesCard from './likes-card';
import OverviewSection from './overview-section';
import PerformanceCards from './performance-cards';
import Sidebar from './sidebar';
import StorageCard from './storage-card';
import UptimeCard from './uptime-card';
import ViewsCard from './views-card';
import VisitorsCard from './visitors-card';
import type {
	Site,
	MediaStorage,
	MonitorUptime,
	Plan,
	Domain,
	EngagementStats,
} from '../data/types';
import './style.scss';

function SiteOverview() {
	const {
		site,
		mediaStorage,
		siteMonitorUptime,
		phpVersion,
		currentPlan,
		primaryDomain,
		engagementStats,
	} = useQuery(
		useLoaderData( {
			from: '/sites/$siteId',
		} )
	).data as {
		site: Site;
		mediaStorage: MediaStorage;
		siteMonitorUptime?: MonitorUptime;
		phpVersion?: string;
		currentPlan: Plan;
		primaryDomain?: Domain;
		engagementStats: EngagementStats;
	};
	return (
		<PageLayout
			title={ site.name }
			actions={
				<>
					<ExternalLink href={ site.url }>{ __( 'Visit' ) }</ExternalLink>
					<Button
						__next40pxDefaultSize
						variant="primary"
						href={ site.options.admin_url }
						icon={ wordpress }
					>
						{ __( 'WP admin' ) }
					</Button>
				</>
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
						<OverviewCard title={ __( 'Subscribers' ) } icon={ envelope } isLink />
					</OverviewSection>
					<OverviewSection title={ __( 'Site health' ) } actions={ [] }>
						<PerformanceCards site={ site } />
						<UptimeCard siteMonitorUptime={ siteMonitorUptime } />
						<StorageCard mediaStorage={ mediaStorage } />
					</OverviewSection>
				</VStack>
			</HStack>
		</PageLayout>
	);
}
export default SiteOverview;
