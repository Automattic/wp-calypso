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
import { seen, comment, starEmpty, envelope, people, wordpress } from '@wordpress/icons';
import PageLayout from '../page-layout';
import OverviewCard from './overview-card';
import OverviewSection from './overview-section';
import Sidebar from './sidebar';
import StorageCard from './storage-card';
import UptimeCard from './uptime-card';
import VisitorsCard from './visitors-card';
import type { FetchSiteRouteResponse } from '../data/types';
import './style.scss';

function SiteOverview() {
	const { site } = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
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
				<Sidebar />
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
						<VisitorsCard />
						<OverviewCard title={ __( 'Views' ) } icon={ seen } isLink></OverviewCard>
						<OverviewCard title={ __( 'Likes' ) } icon={ starEmpty } isLink></OverviewCard>
						<OverviewCard title={ __( 'Comments' ) } icon={ comment } isLink></OverviewCard>
						<OverviewCard title={ __( 'Subscribers' ) } icon={ envelope } isLink></OverviewCard>
					</OverviewSection>
					<OverviewSection title={ __( 'Site health' ) } actions={ [] }>
						<UptimeCard />
						<StorageCard />
					</OverviewSection>
				</VStack>
			</HStack>
		</PageLayout>
	);
}
export default SiteOverview;
