import { useLoaderData } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	ProgressBar,
	ExternalLink,
	Button,
	Card,
} from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import filesize from 'filesize';
import { FetchSiteRouteResponse, MediaStorageObject, MonitorUptimeAPIResponse } from '../data';
import PageLayout from '../page-layout';
import ActivityLog from './activity-log';
import Deployments from './deployments';
import Sidebar from './sidebar';
import './style.scss';

const MINIMUM_DISPLAYED_USAGE = 2.5;
function StorageCard( {
	mediaStorage: { storageUsedBytes, maxStorageBytes },
}: {
	mediaStorage: MediaStorageObject;
} ) {
	let usagePercentage = Math.round( ( ( storageUsedBytes / maxStorageBytes ) * 1000 ) / 10 );
	// Ensure that the displayed usage is never fully empty to
	// avoid a confusing UI and that in never exceeds 100%.
	usagePercentage = Math.min( Math.max( MINIMUM_DISPLAYED_USAGE, usagePercentage ), 100 );

	const used = filesize( storageUsedBytes, { round: 0 } );
	const max = filesize( maxStorageBytes, { round: 0 } );
	return (
		<Card className="site-overview-top-card">
			<VStack style={ { height: '100%', padding: '16px' } }>
				<HStack justify="space-between">
					<Heading level={ 3 }>{ __( 'Storage' ) }</Heading>
					<ExternalLink href="#">{ __( 'Buy more' ) }</ExternalLink>
				</HStack>
				<VStack style={ { marginTop: '16px' } }>
					<HStack>
						{ createInterpolateElement(
							/* translators: %1$s: storage space used, %2$s: maximum available storage space. Eg. '236 MB of 53 GB used' */
							sprintf( __( '<heading>%1$s</heading> <span>of %2$s used</span>' ), used, max ),
							{
								heading: <Heading level={ 3 } style={ { whiteSpace: 'nowrap' } } />,
								span: createElement( 'span' ),
							}
						) }
					</HStack>
					{ /* <p>{ sprintf( __( '%1$s of %2$s used' ), used, max ) }</p> */ }
					<ProgressBar value={ usagePercentage } />
				</VStack>
			</VStack>
		</Card>
	);
}

function SiteMonitorUptimeCard( { siteMonitorUptime }: MonitorUptimeAPIResponse ) {
	if ( ! siteMonitorUptime ) {
		return;
	}
	const { upDays, downDays } = Object.entries( siteMonitorUptime || {} ).reduce(
		( accumulator, [ , { status } = {} as { status: 'up|down' } ] ) => {
			accumulator[ status === 'up' ? 'upDays' : 'downDays' ] += 1;
			return accumulator;
		},
		{ upDays: 0, downDays: 0 }
	);
	const uptimePercentage = Math.round( ( ( upDays / ( upDays + downDays ) ) * 1000 ) / 10 );
	return (
		<Card className="site-overview-top-card">
			<VStack style={ { height: '100%', padding: '16px' } }>
				<HStack justify="space-between">
					<Heading level={ 3 }>{ __( 'Uptime' ) }</Heading>
					<p>{ __( 'Past 30 days' ) }</p>
				</HStack>
				<VStack style={ { marginTop: '16px' } }>
					<Heading level={ 3 }>
						{
							/* translators: %s: percentage of site uptime. Eg. 99% */
							sprintf( __( '%s%%' ), uptimePercentage )
						}
					</Heading>
					<ProgressBar value={ uptimePercentage } />
				</VStack>
			</VStack>
		</Card>
	);
}

function SiteOverview() {
	const { site, mediaStorage, siteMonitorUptime } = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
	return (
		<PageLayout
			title={ site.name }
			actions={
				<>
					<ExternalLink href={ site.url }>{ __( 'Visit' ) }</ExternalLink>
					<Button __next40pxDefaultSize variant="primary">
						{ __( 'Site admin' ) }
					</Button>
				</>
			}
		>
			<HStack alignment="flex-start" spacing={ 8 }>
				<VStack spacing={ 8 } style={ { flex: 3 } }>
					<HStack spacing={ 8 } justify="space-between">
						<StorageCard mediaStorage={ mediaStorage } />
						<SiteMonitorUptimeCard siteMonitorUptime={ siteMonitorUptime } />
						<Card className="site-overview-top-card">
							<VStack style={ { height: '100%', padding: '16px' } }>
								<HStack justify="space-between">
									<Heading level={ 3 }>{ __( 'Protect' ) }</Heading>
								</HStack>
								<p>{ __( 'No threats found' ) }</p>
							</VStack>
						</Card>
					</HStack>

					<VStack spacing={ 8 }>
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
