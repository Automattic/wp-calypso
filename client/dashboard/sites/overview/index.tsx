import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalDivider as Divider,
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { chartBar, published, wordpress } from '@wordpress/icons';
import clsx from 'clsx';
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

type Breakpoint = Parameters< typeof useViewportMatch >[ 0 ];

const SPACING = {
	DEFAULT: 6,
	SMALL: 4,
};

function getGridLayout( {
	count,
	isLargeViewport,
	isSmallViewport,
}: {
	count: number;
	isLargeViewport: boolean;
	isSmallViewport: boolean;
} ) {
	let columns;
	if ( isLargeViewport ) {
		columns = count;
	} else if ( isSmallViewport ) {
		columns = 1;
	} else {
		columns = Math.min( count / 2 );
	}

	return {
		columns,
		rows: count / columns,
	};
}

function SiteOverview( {
	hideSitePreview = false,
	breakpoints,
}: {
	hideSitePreview: boolean;
	breakpoints?: { large: Breakpoint; small: Breakpoint };
} ) {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const isLargeViewport = useViewportMatch( breakpoints?.large ?? 'xlarge' );
	const isSmallViewport = useViewportMatch( breakpoints?.small ?? 'medium', '<' );
	const showSitePreview = ! ( hideSitePreview || isSmallViewport );
	const spacing = isSmallViewport ? SPACING.SMALL : SPACING.DEFAULT;
	const gridLayout = getGridLayout( {
		count: showSitePreview ? 4 : 3,
		isLargeViewport,
		isSmallViewport,
	} );

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
			<VStack alignment="stretch" spacing={ isSmallViewport ? 5 : 10 }>
				<Grid { ...gridLayout } gap={ spacing }>
					{ showSitePreview && <SitePreviewCard site={ site } /> }
					<VStack className="site-overview-cards" spacing={ spacing }>
						<OverviewCard
							title={ __( 'Visibility' ) }
							icon={ published }
							heading="TBA"
							description="TBA"
						/>
						<BackupCard site={ site } />
					</VStack>
					<VStack className="site-overview-cards" spacing={ spacing }>
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
				<HStack
					className={ clsx( 'site-overview-cards', 'site-overview-cards--secondary', {
						'is-large': isLargeViewport,
					} ) }
					spacing={ spacing }
					alignment="flex-start"
				>
					<VStack spacing={ spacing } justify="start">
						<PerformanceCards site={ site } />
					</VStack>
					<VStack spacing={ spacing } justify="start">
						<StorageCard site={ site } />
						<UptimeCard site={ site } />
					</VStack>
				</HStack>
			</VStack>
		</PageLayout>
	);
}

export default SiteOverview;
