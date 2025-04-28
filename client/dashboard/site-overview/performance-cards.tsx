import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { desktop, mobile } from '@wordpress/icons';
import CoreBadge from 'calypso/components/core/badge';
import wp from 'calypso/lib/wp';
import OverviewCard, { OverviewCardProgressBar } from '../overview-card';
import type { Site, UrlPerformanceInsights } from '../data/types';

type BadgeIntent = 'default' | 'info' | 'success' | 'warning' | 'error';

function PerformanceBadge( { value }: { value: number | undefined } ) {
	const badgeProps = { intent: 'error' as BadgeIntent, label: __( 'Poor' ) };
	if ( ! value ) {
		badgeProps.label = __( 'Calculating…' );
		badgeProps.intent = 'default';
	} else if ( value >= 90 ) {
		badgeProps.intent = 'success';
		badgeProps.label = __( 'Excellent' );
	} else if ( value >= 50 ) {
		badgeProps.intent = 'warning';
		badgeProps.label = __( 'Needs Improvement' );
	}
	return (
		<CoreBadge intent={ badgeProps.intent } style={ { width: 'fit-content' } }>
			{ badgeProps.label }
		</CoreBadge>
	);
}

export default function PerformanceCards( { site }: { site: Site } ) {
	const { data: siteSettings, isLoading: isLoadingSiteSettings } = useQuery( {
		queryKey: [ 'site-settings', site.ID ],
		queryFn: () => wp.req.get( { path: `/sites/${ site.ID }/settings` }, { apiVersion: '1.4' } ),
		refetchOnWindowFocus: false,
		retry: false,
		enabled: !! site.ID,
	} );
	const wpcomPerformanceReportUrl = siteSettings?.settings?.wpcom_performance_report_url || '';
	const [ , cachedHash ] = wpcomPerformanceReportUrl.split( '&hash=' );
	const { URL: url } = site;
	// First fetch basic metrics to get the token/hash.
	const { data: basicMetricsData } = useQuery( {
		queryKey: [ 'url', 'basic-metrics', url ],
		queryFn: () =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/basic',
					apiNamespace: 'wpcom/v2',
				},
				// Important: advance=1 is needed to get the `token` and request advanced metrics.
				{ url, advance: '1' }
			),
		refetchOnWindowFocus: false,
		enabled: !! url && ! isLoadingSiteSettings && ! cachedHash,
	} );
	const token = cachedHash || basicMetricsData?.token;
	// Then use the token to fetch performance insights.
	const { data } = useQuery< UrlPerformanceInsights >( {
		queryKey: [ 'url', 'performance', url, token ],
		queryFn: () =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/advanced/insights',
					apiNamespace: 'wpcom/v2',
				},
				{ url, advance: '1', hash: token }
			),
		enabled: !! url && !! token,
		refetchOnWindowFocus: false,
		refetchInterval: ( query ) => {
			if ( query.state.data?.pagespeed?.status === 'completed' ) {
				return false;
			}
			return 5000;
		},
	} );
	const desktopLoaded = typeof data?.pagespeed?.desktop === 'object';
	const mobileLoaded = typeof data?.pagespeed?.mobile === 'object';
	const desktopScore =
		desktopLoaded && typeof data.pagespeed.desktop === 'object'
			? Math.round( data.pagespeed.desktop.overall_score * 100 )
			: undefined;
	const mobileScore =
		mobileLoaded && typeof data.pagespeed.mobile === 'object'
			? Math.round( data.pagespeed.mobile.overall_score * 100 )
			: undefined;
	return (
		<>
			<OverviewCard
				title={ __( 'Desktop performance' ) }
				icon={ desktop }
				heading={ desktopLoaded ? `${ desktopScore }` : '\u00A0' }
			>
				<OverviewCardProgressBar value={ desktopScore } />
				<PerformanceBadge value={ desktopScore } />
			</OverviewCard>
			<OverviewCard
				title={ __( 'Mobile performance' ) }
				icon={ mobile }
				heading={ mobileLoaded ? `${ mobileScore }` : '\u00A0' }
			>
				<OverviewCardProgressBar value={ mobileScore } />
				<PerformanceBadge value={ mobileScore } />
			</OverviewCard>
		</>
	);
}
