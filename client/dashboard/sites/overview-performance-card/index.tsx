import { HostingFeatures } from '@automattic/api-core';
import { siteSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { usePerformanceData } from '../../app/hooks/site-performance';
import { useTimeSince } from '../../components/time-since';
import { getPerformanceStatus, getPerformanceStatusText } from '../../utils/site-performance';
import HostingFeatureGatedWithOverviewCard from '../hosting-feature-gated-with-overview-card';
import OverviewCard from '../overview-card';
import type { PerformanceReport, Site, UrlPerformanceInsights } from '@automattic/api-core';

const CARD_PROPS = {
	icon: chartBar,
	title: __( 'Performance' ),
	tracksId: 'performance',
};

function getPerformanceUrl( site: Site, device?: string ) {
	const url = window?.location?.pathname?.startsWith( '/v2' )
		? `/sites/${ site.slug }/performance`
		: `/sites/performance/${ site.slug }`;

	return device && device !== 'mobile' ? addQueryArgs( url, { initialTab: device } ) : url;
}

function PerformanceCardContentWithoutTests( { site }: { site: Site } ) {
	return (
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ __( 'Run a test' ) }
			description={ __( 'Your site hasn’t been tested yet.' ) }
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

	const device = desktopScore < mobileScore ? 'desktop' : 'mobile';
	const report = performanceData.pagespeed[ device ] as PerformanceReport;

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
			__( 'Tested %s.' ),
			timeSinceLastTest
		);
	} else {
		const recommendationCount = Object.keys( report.audits ).length;
		description = sprintf(
			// translators: %(days) is the number of days until the link expires.
			_n( '%d recommendation available.', '%d recommendations available.', recommendationCount ),
			recommendationCount
		);
	}

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

	if ( site.launch_status === 'unlaunched' ) {
		return (
			<OverviewCard
				{ ...CARD_PROPS }
				heading={ __( 'No results' ) }
				description={ __( 'Launch your site to test performance.' ) }
				disabled
			/>
		);
	}

	if ( site.is_coming_soon || site.is_private ) {
		return (
			<OverviewCard
				{ ...CARD_PROPS }
				heading={ __( 'No results' ) }
				description={ __( 'Make your site public to test performance.' ) }
				disabled
			/>
		);
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
			upsellHeading={ __( 'Test site performance' ) }
			upsellDescription={ __( 'Get detailed metrics and recommendations.' ) }
			upsellLink={ getPerformanceUrl( site ) }
		>
			<PerformanceCardContent site={ site } />
		</HostingFeatureGatedWithOverviewCard>
	);
}
