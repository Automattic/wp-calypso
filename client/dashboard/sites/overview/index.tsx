import { siteBySlugQuery } from '@automattic/api-queries';
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
import { wordpress } from '@wordpress/icons';
import clsx from 'clsx';
import { useRef } from 'react';
import { GuidedTourContextProvider, GuidedTourStep } from '../../components/guided-tour';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getSiteDisplayName } from '../../utils/site-name';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import AgencySiteShareCard from '../overview-agency-site-share-card';
import BackupCard from '../overview-backup-card';
import DIFMUpsellCard from '../overview-difm-upsell-card';
import DomainsCard from '../overview-domains-card';
import OverviewFlexUsageCard from '../overview-flex-usage-card';
import LatestActivityCard from '../overview-latest-activity-card';
import MigrateSiteCard from '../overview-migrate-site-card';
import PerformanceCard from '../overview-performance-card';
import PlanCard from '../overview-plan-card';
import ScanCard from '../overview-scan-card';
import SiteActionMenu from '../overview-site-action-menu';
import SiteOverviewFields from '../overview-site-fields';
import SitePreviewCard from '../overview-site-preview-card';
import SubscribersCard from '../overview-subscribers-card';
import VisibilityCard from '../overview-visibility-card';
import StagingSiteSyncDropdown from '../staging-site-sync-dropdown';
import { StorageWarningBanner } from './storage-warning-banner';
import type { WPBreakpoint } from '@wordpress/compose/build-types/hooks/use-viewport-match';
import './style.scss';

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
	siteSlug,
	hideSitePreview = false,
	breakpoints,
}: {
	siteSlug: string;
	hideSitePreview?: boolean;
	breakpoints?: { large: WPBreakpoint; small: WPBreakpoint };
} ) {
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

	const wpAdminButtonRef = useRef( null );

	const isSelfHostedJetpackConnectedSite = isSelfHostedJetpackConnected( site );
	const showFlexUsageCard = site.is_wpcom_flex;

	return (
		<PageLayout
			header={
				<VStack>
					<PageHeader
						title={ getSiteDisplayName( site ) }
						actions={
							site.options?.admin_url && (
								<>
									<StagingSiteSyncDropdown siteSlug={ siteSlug } />
									<Button
										ref={ wpAdminButtonRef }
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
				<StorageWarningBanner site={ site } />
				<Grid { ...gridLayout } gap={ spacing }>
					{ showSitePreview && <SitePreviewCard site={ site } /> }
					<Grid columns={ 1 } rows={ 2 } gap={ spacing }>
						<VisibilityCard site={ site } />
						<BackupCard site={ site } />
					</Grid>
					<Grid columns={ 1 } rows={ 2 } gap={ spacing }>
						{ ( () => {
							if ( site.is_a4a_dev_site ) {
								return <AgencySiteShareCard site={ site } />;
							}
							if ( isSelfHostedJetpackConnectedSite ) {
								return <SubscribersCard site={ site } />;
							}
							if ( site.plan?.is_free && ! site.is_wpcom_staging_site ) {
								return <MigrateSiteCard site={ site } />;
							}
							return <PerformanceCard site={ site } />;
						} )() }
						<ScanCard site={ site } />
					</Grid>
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
						{ showFlexUsageCard && <OverviewFlexUsageCard site={ site } /> }
						{ ! isSelfHostedJetpackConnectedSite && ! site.is_wpcom_staging_site && (
							<>
								<DomainsCard site={ site } isCompact={ isSmallViewport } />
								<DIFMUpsellCard site={ site } />
							</>
						) }
					</VStack>
				</HStack>
			</VStack>
			<GuidedTourContextProvider
				tourId="hosting-dashboard-tours-site-overview"
				guidedTours={ [
					{
						id: 'hosting-dashboard-tours-site-overview-wp-admin',
						title: __( 'Go to WP Admin' ),
						description: __(
							'Use this button to quickly switch from the Hosting Dashboard to your WP Admin.'
						),
					},
				] }
			>
				{ wpAdminButtonRef.current && (
					<GuidedTourStep
						id="hosting-dashboard-tours-site-overview-wp-admin"
						target={ wpAdminButtonRef.current }
						placement="bottom"
						inline
					/>
				) }
			</GuidedTourContextProvider>
		</PageLayout>
	);
}

export default SiteOverview;
