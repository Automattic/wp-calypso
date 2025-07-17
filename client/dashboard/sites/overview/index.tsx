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
import { chartBar, wordpress } from '@wordpress/icons';
import clsx from 'clsx';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getSiteDisplayName } from '../../utils/site-name';
import OverviewCard from '../overview-card';
import OverviewCardUpsellDIFM from '../overview-card-upsell-difm';
import AgencySiteShareCard from './agency-site-share-card';
import BackupCard from './backup-card';
import DomainsCard from './domains-card';
import PerformanceCards from './performance-cards';
import ScanCard from './scan-card';
import SiteOverviewFields from './site-overview-fields';
import SitePreviewCard from './site-preview-card';
import UptimeCard from './uptime-card';
import VisibilityCard from './visibility-card';
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
	if ( isLargeViewport ) {
		return {
			columns: count,
			rows: 1,
		};
	}

	if ( isSmallViewport ) {
		return {
			columns: 1,
			rows: count,
		};
	}

	return {
		columns: 2,
		rows: Math.ceil( count / 2 ),
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
				<VStack>
					<PageHeader
						title={ getSiteDisplayName( site ) }
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
					<SiteOverviewFields site={ site } />
				</VStack>
			}
		>
			<VStack alignment="stretch" spacing={ isSmallViewport ? 5 : 10 }>
				<Grid { ...gridLayout } gap={ spacing }>
					{ showSitePreview && <SitePreviewCard site={ site } /> }
					<VStack className="site-overview-cards" spacing={ spacing }>
						<VisibilityCard site={ site } />
						<BackupCard site={ site } />
					</VStack>
					<VStack className="site-overview-cards" spacing={ spacing }>
						{ site.is_a4a_dev_site ? (
							<AgencySiteShareCard site={ site } />
						) : (
							<OverviewCard
								title={ __( 'Performance' ) }
								icon={ chartBar }
								heading="TBA"
								description="TBA"
							/>
						) }
						<ScanCard site={ site } />
					</VStack>
					<OverviewCard title={ __( 'Plan' ) } icon={ wordpress } heading="TBA" />
				</Grid>
				<Divider
					orientation="horizontal"
					style={ { color: 'var(--dashboard-overview__divider-color)' } }
				/>
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
						<OverviewCardUpsellDIFM site={ site } />
						<DomainsCard site={ site } type={ isSmallViewport ? 'list' : 'table' } />
						<UptimeCard site={ site } />
					</VStack>
				</HStack>
			</VStack>
		</PageLayout>
	);
}

export default SiteOverview;
