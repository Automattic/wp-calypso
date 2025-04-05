import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	ProgressBar,
	ExternalLink,
	Button,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRouteLoaderData } from 'react-router-dom';
import { type FetchSiteRouteResponse } from '../data';
import PageLayout from '../page-layout';
import ActivityLog from './activity-log';
import Deployments from './deployments';
import Sidebar from './sidebar';
import './style.scss';

const MINIMUM_DISPLAYED_USAGE = 2.5;
function StorageCard( { mediaStorage: { storageUsedBytes, maxStorageBytes } = {} } ) {
	let usagePercent = Math.round( ( ( storageUsedBytes / maxStorageBytes ) * 1000 ) / 10 );
	// Ensure that the displayed usage is never fully empty to avoid a confusing UI
	usagePercent = Math.max( MINIMUM_DISPLAYED_USAGE, usagePercent );
	// Make sure displayed usage never exceeds 100%
	usagePercent = Math.min( usagePercent, 100 );

	// const used = filesize( storageUsedBytes, { round: 0 } );
	// const max = filesize( maxStorageBytes, { round: 0 } );
	return (
		<Card className="site-overview-top-card">
			<VStack style={ { height: '100%', padding: '16px' } }>
				<HStack justify="space-between">
					<Heading level={ 3 }>{ __( 'Storage' ) }</Heading>
					<ExternalLink href="#">{ __( 'Buy more' ) }</ExternalLink>
				</HStack>
				<VStack style={ { marginTop: '16px' } }>
					<p>{ __( '3GB of 50GB used' ) }</p>
					<ProgressBar value={ usagePercent } />
				</VStack>
			</VStack>
		</Card>
	);
}

function SiteOverview() {
	const { site, mediaStorage } = useRouteLoaderData( 'site' ) as FetchSiteRouteResponse;

	// TODO: This should be fetched from the API
	const uptimePercentage = 98;
	return (
		<PageLayout
			title={ site.name }
			actions={
				<>
					<ExternalLink href={ site.url }>{ __( 'Visit' ) }</ExternalLink>
					<Button>{ __( 'Site admin' ) }</Button>
				</>
			}
		>
			<HStack alignment="flex-start" spacing={ 4 }>
				<VStack spacing={ 4 } style={ { flex: 3 } }>
					<HStack spacing={ 3 } justify="space-between">
						<StorageCard mediaStorage={ mediaStorage } />
						<Card className="site-overview-top-card">
							<VStack style={ { height: '100%', padding: '16px' } }>
								<HStack justify="space-between">
									<Heading level={ 3 }>{ __( 'Uptime' ) }</Heading>
									<p>{ __( 'past 30 days' ) }</p>
								</HStack>
								<VStack style={ { marginTop: '16px' } }>
									<Heading level={ 3 }>{ uptimePercentage }</Heading>
									<ProgressBar value={ uptimePercentage } />
								</VStack>
							</VStack>
						</Card>
						<Card className="site-overview-top-card">
							<VStack style={ { height: '100%', padding: '16px' } }>
								<HStack justify="space-between">
									<Heading level={ 3 }>{ __( 'Protect' ) }</Heading>
								</HStack>
								<p>{ __( 'No threats found' ) }</p>
							</VStack>
						</Card>
					</HStack>

					<VStack spacing={ 4 }>
						<ActivityLog />
						<Deployments />
					</VStack>
				</VStack>
				<Sidebar site={ site } />
			</HStack>
		</PageLayout>
	);
}

export default SiteOverview;
