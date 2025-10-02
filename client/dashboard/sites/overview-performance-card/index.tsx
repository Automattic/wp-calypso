import { HostingFeatures, SitePerformancePage } from '@automattic/api-core';
import { sitePerformancePagesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { usePerformanceData } from '../../app/hooks/site-performance';
import { useTimeSince } from '../../components/time-since';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { getPerformanceStatus, getStatusIntent, getStatusText } from '../../utils/site-performance';
import HostingFeatureGatedWithOverviewCard from '../hosting-feature-gated-with-overview-card';
import OverviewCard from '../overview-card';
import type { SitePerformanceReport, Site } from '@automattic/api-core';

const CARD_PROPS = {
	icon: chartBar,
	title: __( 'Performance' ),
	tracksId: 'performance',
};

function getPerformanceUrl( site: Site, device?: string ) {
	const url = isDashboardBackport()
		? `/sites/performance/${ site.slug }`
		: `/sites/${ site.slug }/performance`;

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
	report,
	score,
	performanceUrl,
}: {
	report: SitePerformanceReport;
	score: number;
	performanceUrl: string;
} ) {
	const valuation = getPerformanceStatus( score );
	const timeSinceLastTest = useTimeSince( report.timestamp ?? '' );

	let description;
	if ( valuation === 'good' ) {
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
			heading={ getStatusText( valuation ) }
			description={ description }
			intent={ getStatusIntent( valuation ) }
			link={ performanceUrl }
		/>
	);
}

function PerformanceCardContentWithTests( {
	site,
	page,
}: {
	site: Site;
	page: SitePerformancePage;
} ) {
	const { desktopReport, mobileReport, desktopScore, mobileScore } = usePerformanceData(
		page.link,
		page.wpcom_performance_report_hash
	);

	if ( ! desktopReport || ! mobileReport ) {
		return <OverviewCard { ...CARD_PROPS } isLoading />;
	}

	if ( ! desktopScore || ! mobileScore ) {
		return <PerformanceCardContentWithoutTests site={ site } />;
	}

	const report = desktopScore < mobileScore ? desktopReport : mobileReport;
	const worseScore = Math.min( desktopScore, mobileScore );
	const performanceUrl =
		desktopScore < mobileScore
			? getPerformanceUrl( site, 'desktop' )
			: getPerformanceUrl( site, 'mobile' );

	return (
		<PerformanceCardContentWithFinishedTests
			report={ report }
			score={ worseScore }
			performanceUrl={ performanceUrl }
		/>
	);
}

function PerformanceCardContent( { site }: { site: Site } ) {
	const { data: pages, isLoading } = useQuery( {
		...sitePerformancePagesQuery( site.ID ),
		refetchOnWindowFocus: false,
	} );

	if ( isLoading ) {
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

	if ( ! pages || pages.length === 0 ) {
		return <PerformanceCardContentWithoutTests site={ site } />;
	}

	return <PerformanceCardContentWithTests site={ site } page={ pages[ 0 ] } />;
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
