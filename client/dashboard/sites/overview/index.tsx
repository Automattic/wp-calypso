import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalDivider as Divider,
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar, published, wordpress } from '@wordpress/icons';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getSiteDisplayName } from '../../utils/site-name';
import OverviewCard from '../overview-card';
import BackupCard from './backup-card';
import PerformanceCards from './performance-cards';
import ScanCard from './scan-card';
import SiteOverviewFields from './site-overview-fields';
import SitePreviewCard from './site-preview-card';
import StorageCard from './storage-card';
import UptimeCard from './uptime-card';
import './style.scss';

function SiteOverview() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

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
						<OverviewCard
							title={ __( 'Visibility' ) }
							icon={ published }
							heading="TBA"
							description="TBA"
						/>
						<BackupCard site={ site } />
					</VStack>
					<VStack className="site-overview-cards" spacing={ 6 }>
						<OverviewCard
							title={ __( 'Performance' ) }
							icon={ chartBar }
							heading="TBA"
							description="TBA"
						/>
						<ScanCard site={ site } />
					</VStack>
					<OverviewCard title={ __( 'Plan' ) } icon={ wordpress } heading="TBA" />
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
