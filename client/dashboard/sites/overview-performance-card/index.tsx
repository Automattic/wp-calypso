import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { usePerformanceData } from '../../app/hooks/site-performance';
import { siteSettingsQuery } from '../../app/queries/site-settings';
import { useTimeSince } from '../../components/time-since';
import { HostingFeatures } from '../../data/constants';
import { getPerformanceStatus, getPerformanceStatusText } from '../../utils/site-performance';
import HostingFeatureGatedWithOverviewCard from '../hosting-feature-gated-with-overview-card';
import OverviewCard from '../overview-card';
import type { PerformanceReport, Site, UrlPerformanceInsights } from '../../data/types';

const CARD_PROPS = {
	icon: chartBar,
	title: __( 'Performance' ),
	tracksId: 'performance',
};

function getPerformanceUrl( site: Site, device?: string ) {
	return addQueryArgs(
		`/sites/performance/${ site.slug }`,
		device !== 'mobile' ? { initialTab: device } : {}
	);
}

function PerformanceCardContentWithoutTests( { site }: { site: Site } ) {
	return (
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ __( 'Run a test' ) }
			description={ __( 'Your site hasn’t been tested yet' ) }
			link={ getPerformanceUrl( site ) }
		/>
	);
}

function PerformanceCardContentWithFinishedTests( {
	site,
	performanceData,
	desktopScore,
	mobileScore,
}: {
	site: Site;
	performanceData: UrlPerformanceInsights;
	desktopScore: number;
	mobileScore: number;
} ) {
	const worseScore = Math.min( desktopScore, mobileScore );

	const status = getPerformanceStatus( worseScore );
	const statusText = getPerformanceStatusText( status );

	const report =
		desktopScore < mobileScore
			? ( performanceData.pagespeed.desktop as PerformanceReport )
			: ( performanceData.pagespeed.mobile as PerformanceReport );

	const timeSinceLastTest = useTimeSince( report.timestamp );

	let intent;
	if ( status === 'poor' ) {
		intent = 'error' as const;
	} else if ( status === 'neutral' ) {
		intent = 'warning' as const;
	} else {
		intent = 'success' as const;
	}

	let description;
	if ( status === 'good' ) {
		description = sprintf(
			/* translators: %s: time since last test run */
			__( 'Tested %s' ),
			timeSinceLastTest
		);
	} else {
		const recommendationCount = Object.keys( report.audits ).length;
		description = sprintf(
			// translators: %(days) is the number of days until the link expires.
			_n( '%d recommendation available', '%d recommendations available', recommendationCount ),
			recommendationCount
		);
	}

	const device = desktopScore < mobileScore ? 'desktop' : 'mobile';

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ statusText }
			description={ description }
			intent={ intent }
			link={ getPerformanceUrl( site, device ) }
		/>
	);
}

function PerformanceCardContentWithTests( { site }: { site: Site } ) {
	const { performanceData, desktopScore, mobileScore } = usePerformanceData( site.ID, site.URL );

	if ( performanceData === undefined ) {
		return <OverviewCard { ...CARD_PROPS } isLoading />;
	}

	if ( desktopScore === undefined || mobileScore === undefined ) {
		return <PerformanceCardContentWithoutTests site={ site } />;
	}

	return (
		<PerformanceCardContentWithFinishedTests
			site={ site }
			performanceData={ performanceData }
			desktopScore={ desktopScore }
			mobileScore={ mobileScore }
		/>
	);
}

function PerformanceCardContent( { site }: { site: Site } ) {
	const { data: settings } = useQuery( siteSettingsQuery( site.ID ) );

	if ( settings === undefined ) {
		return <OverviewCard { ...CARD_PROPS } isLoading />;
	}

	if ( ! settings.wpcom_performance_report_url ) {
		return <PerformanceCardContentWithoutTests site={ site } />;
	}

	return <PerformanceCardContentWithTests site={ site } />;
}

export default function PerformanceCard( { site }: { site: Site } ) {
	return (
		<HostingFeatureGatedWithOverviewCard
			site={ site }
			feature={ HostingFeatures.PERFORMANCE }
			featureIcon={ CARD_PROPS.icon }
			tracksFeatureId={ CARD_PROPS.tracksId }
			upsellHeading={ __( 'Run a test' ) }
			upsellDescription={ __( 'Your site hasn’t been tested yet' ) }
			upsellExternalLink={ getPerformanceUrl( site ) }
		>
			<PerformanceCardContent site={ site } />
		</HostingFeatureGatedWithOverviewCard>
	);
}
