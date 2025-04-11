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
import PageLayout from '../page-layout';
import CommentsCard from './comments-card';
import LikesCard from './likes-card';
import OverviewCard from './overview-card';
import OverviewSection from './overview-section';
import PerformanceCards from './performance-cards';
import Sidebar from './sidebar';
import StorageCard from './storage-card';
import UptimeCard from './uptime-card';
import ViewsCard from './views-card';
import VisitorsCard from './visitors-card';
import type { FetchSiteRouteResponse } from '../data/types';
import './style.scss';

function SiteOverview() {
	const data = useQuery(
		useLoaderData( {
			from: '/sites/$siteId',
		} )
	).data as FetchSiteRouteResponse;
	const { site } = data;
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
				<Sidebar { ...data } />
				<VStack spacing={ 8 }>
					<Card className="site-overview-card site-overview-ai-card">
						<Text>
							{ __(
								'Your site is secure with excellent desktop performance and growing subscribers; now focus on boosting mobile speed and investigating recent drops in views and likes.'
							) }
						</Text>
						<p>{ __( 'WordPress with AI' ) }</p>
					</Card>
					<OverviewSection title={ __( 'Engagement' ) } actions={ [] }>
						<VisitorsCard { ...data } />
						<ViewsCard { ...data } />
						<LikesCard { ...data } />
						<CommentsCard { ...data } />
						<OverviewCard title={ __( 'Subscribers' ) } icon={ envelope } isLink></OverviewCard>
					</OverviewSection>
					<OverviewSection title={ __( 'Site health' ) } actions={ [] }>
						<PerformanceCards { ...data } />
						<UptimeCard { ...data } />
						<StorageCard { ...data } />
					</OverviewSection>
				</VStack>
			</HStack>
		</PageLayout>
	);
}
export default SiteOverview;
