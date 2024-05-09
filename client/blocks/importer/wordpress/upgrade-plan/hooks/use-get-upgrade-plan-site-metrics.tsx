import { getQueryArg } from '@wordpress/url';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { upgradePlanSiteMetricsLcpThreshold } from '../constants';

export const UseGetUpgradePlanSiteMetrics = () => {
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { data: siteMetricData } = useUrlBasicMetricsQuery( importSiteQueryParam );
	const showUpdatedSpeedMetrics =
		siteMetricData?.basic?.lcp && siteMetricData?.basic?.lcp > upgradePlanSiteMetricsLcpThreshold;

	return {
		showUpdatedSpeedMetrics,
		siteMetricData,
	};
};
