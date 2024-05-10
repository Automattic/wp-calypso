import { getQueryArg } from '@wordpress/url';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { upgradePlanSiteMetricsLcpThreshold } from '../constants';

export const useGetUpgradePlanSiteMetrics = () => {
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { data: siteMetricData } = useUrlBasicMetricsQuery( importSiteQueryParam );
	let showUpdatedSpeedMetrics = false;
	let lcpPercentageDifference = 0;

	if (
		siteMetricData?.basic?.lcp &&
		siteMetricData?.basic?.lcp > upgradePlanSiteMetricsLcpThreshold
	) {
		lcpPercentageDifference =
			( siteMetricData?.basic?.lcp &&
				Math.round(
					100 *
						Math.abs(
							( siteMetricData?.basic?.lcp - upgradePlanSiteMetricsLcpThreshold ) /
								( ( siteMetricData?.basic?.lcp + upgradePlanSiteMetricsLcpThreshold ) / 2 )
						)
				) ) ||
			0;

		if ( lcpPercentageDifference > 0 ) {
			showUpdatedSpeedMetrics = true;
		}
	}

	return {
		showUpdatedSpeedMetrics,
		siteMetricData,
		lcpPercentageDifference,
	};
};
