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
import AgencySiteShareCard from '../overview-agency-site-share-card';
import BackupCard from '../overview-backup-card';
import OverviewCard from '../overview-card';
import DIFMUpsellCard from '../overview-difm-upsell-card';
import DomainsCard from '../overview-domains-card';
import LatestActivityCard from '../overview-latest-activity-card';
import PlanCard from '../overview-plan-card';
import ScanCard from '../overview-scan-card';
import SiteActionMenu from '../overview-site-action-menu';
import SiteOverviewFields from '../overview-site-fields';
import SitePreviewCard from '../overview-site-preview-card';
import VisibilityCard from '../overview-visibility-card';
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
								<>
									<Button
										__next40pxDefaultSize
										variant="primary"
										href={ site.options.admin_url }
										icon={ wordpress }
									>
										{ __( 'WP Admin' ) }
									</Button>
									<SiteActionMenu site={ site } />
								</>
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
								disabled
							/>
						) }
						<ScanCard site={ site } />
					</VStack>
					<PlanCard site={ site } />
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
					<LatestActivityCard site={ site } isCompact={ isSmallViewport } />
					<VStack spacing={ spacing } justify="start">
						<DomainsCard site={ site } isCompact={ isSmallViewport } />
						<DIFMUpsellCard site={ site } />
					</VStack>
				</HStack>
			</VStack>
		</PageLayout>
	);
}

export default SiteOverview;
