import { useQuery } from '@tanstack/react-query';
import { useLoaderData } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { desktop, mobile } from '@wordpress/icons';
import CoreBadge from 'calypso/components/core/badge';
import wp from 'calypso/lib/wp';
import OverviewCard, { OverviewCardProgressBar } from './overview-card';
import type { FetchSiteRouteResponse } from '../data/types';
import type { UrlPerformanceInsightsQueryResponse } from 'calypso/data/site-profiler/types';

function PerformanceBadge( { value }: { value: number } ) {
	const badgeProps = { intent: 'error', label: __( 'Poor' ) };
	if ( value >= 90 ) {
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

export default function PerformanceCards() {
	const {
		site: { url },
	} = useLoaderData( {
		from: '/sites/$siteId',
	} ) as FetchSiteRouteResponse;
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
		enabled: !! url,
	} );
	const token = basicMetricsData?.token;
	// Then use the token to fetch performance insights.
	const { data } = useQuery< UrlPerformanceInsightsQueryResponse >( {
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
	// TODO: check `usePerformanceReport` hook and possible `token` changes
	// that might trigger the requests again..
	if ( data?.pagespeed?.status !== 'completed' ) {
		return null;
	}
	const desktopScore = Math.round( data.pagespeed.mobile.overall_score * 100 );
	const mobileScore = Math.round( data.pagespeed.desktop.overall_score * 100 );
	return (
		<>
			<OverviewCard
				title={ __( 'Desktop performance' ) }
				icon={ desktop }
				heading={ `${ desktopScore }` }
			>
				<OverviewCardProgressBar value={ desktopScore } />
				<PerformanceBadge value={ desktopScore } />
			</OverviewCard>

			<OverviewCard
				title={ __( 'Mobile performance' ) }
				icon={ mobile }
				heading={ `${ mobileScore }` }
			>
				<OverviewCardProgressBar value={ mobileScore } />
				<PerformanceBadge value={ mobileScore } />
			</OverviewCard>
		</>
	);
}
