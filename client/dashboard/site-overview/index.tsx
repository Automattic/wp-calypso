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
import { wordpress, people, seen, starEmpty, comment } from '@wordpress/icons';
import { siteQuery } from '../app/queries';
import { siteRoute } from '../app/router';
import OverviewCard from '../overview-card';
import PageLayout from '../page-layout';
import OverviewSection from './overview-section';
import PerformanceCards from './performance-cards';
import Sidebar from './sidebar';
import StorageCard from './storage-card';
import SubscribersCard from './subscribers-card';
import TrendComparisonBadge from './trend-comparizon-badge';
import UptimeCard from './uptime-card';

import './style.scss';

function SiteOverview() {
	const { siteId } = siteRoute.useParams();
	const { data } = useQuery( siteQuery( siteId ) );
	if ( ! data ) {
		return;
	}
	const {
		site,
		mediaStorage,
		siteMonitorUptime,
		phpVersion,
		currentPlan,
		primaryDomain,
		engagementStats,
	} = data;
	return (
		<PageLayout
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
						{ engagementStats.data
							.reduce(
								( accumulator, [ , visitors, views, likes, comments ], index, data ) => {
									const key = index < data.length / 2 ? 'previous' : 'current';
									accumulator[ 0 ][ key ] += visitors;
									accumulator[ 1 ][ key ] += views;
									accumulator[ 2 ][ key ] += likes;
									accumulator[ 3 ][ key ] += comments;
									return accumulator;
								},
								[
									{ previous: 0, current: 0, icon: people, title: __( 'Visitors' ) },
									{ previous: 0, current: 0, icon: seen, title: __( 'Views' ) },
									{ previous: 0, current: 0, icon: starEmpty, title: __( 'Likes' ) },
									{ previous: 0, current: 0, icon: comment, title: __( 'Comments' ) },
								]
							)
							.map( ( { current, previous, icon, title } ) => (
								<OverviewCard
									key={ title }
									title={ title }
									icon={ icon }
									heading={ `${ current }` }
									metaText={ __( 'Past 7 days' ) }
									isLink
								>
									<TrendComparisonBadge count={ current } previousCount={ previous } />
								</OverviewCard>
							) ) }
						<SubscribersCard subscribers={ site.subscribers_count } />
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
