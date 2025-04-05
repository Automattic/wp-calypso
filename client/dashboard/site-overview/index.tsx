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
import { __, sprintf } from '@wordpress/i18n';
import filesize from 'filesize';
import { type FetchSiteRouteResponse, type MediaStorageObject } from '../data';
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
					<p>
						{
							/* translators: %(used)s: storage space used, %(max)s: maximum available storage space */
							sprintf( __( '%(used)s of %(max)s used' ), {
								used,
								max,
							} )
						}
					</p>
					<ProgressBar value={ usagePercentage } />
				</VStack>
			</VStack>
		</Card>
	);
}

function SiteOverview() {
	const { site, mediaStorage } = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;

	// TODO: This should be fetched from the API
	const uptimePercentage = 98;
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
