import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	ExternalLink,
	Button,
	Card,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRouteLoaderData } from 'react-router-dom';
import { type SiteObject } from '../data';
import PageLayout from '../page-layout';
import ActivityLog from './activity-log';
import Deployments from './deployments';
import Sidebar from './sidebar';

function SiteOverview() {
	const item = useRouteLoaderData( 'site' ) as SiteObject;
	return (
		<PageLayout
			title={ item.name }
			actions={
				<>
					<ExternalLink href={ item.url }>{ __( 'Visit' ) }</ExternalLink>
					<Button>{ __( 'Site admin' ) }</Button>
				</>
			}
		>
			<HStack alignment="flex-start" spacing={ 4 }>
				<VStack spacing={ 4 } style={ { flex: 3 } }>
					<HStack spacing={ 3 }>
						<Card style={ { flex: 1, height: '200px' } }>
							<VStack style={ { height: '100%', padding: '16px' } }>
								<HStack justify="space-between">
									<Heading level={ 3 }>{ __( 'Storage' ) }</Heading>
									<ExternalLink href="#">{ __( 'Buy more' ) }</ExternalLink>
								</HStack>
								<VStack style={ { marginTop: '16px' } }>
									<p>{ __( '3GB of 50GB used' ) }</p>
								</VStack>
							</VStack>
						</Card>
						<Card style={ { flex: 1, height: '200px' } }>
							<VStack style={ { height: '100%', padding: '16px' } }>
								<HStack justify="space-between">
									<Heading level={ 3 }>{ __( 'Uptime' ) }</Heading>
									<p>{ __( 'past 30 days' ) }</p>
								</HStack>
								<VStack style={ { marginTop: '16px' } }>
									<div
										style={ {
											width: '100%',
											height: '8px',
											backgroundColor: '#f0f0f0',
											borderRadius: '4px',
											marginTop: '8px',
										} }
									>
										<div
											style={ {
												width: '98%',
												height: '100%',
												backgroundColor: '#1e8cbe',
												borderRadius: '4px',
											} }
										/>
									</div>
									<p style={ { marginTop: '8px' } }>{ __( '98% uptime' ) }</p>
								</VStack>
							</VStack>
						</Card>
						<Card style={ { flex: 1, height: '200px' } }>
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
				<Sidebar siteName={ item.name } siteUrl={ item.url } />
			</HStack>
		</PageLayout>
	);
}

export default SiteOverview;
