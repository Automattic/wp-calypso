import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { getQueryArg } from '@wordpress/url';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { upgradePlanSiteMetricsLcpThreshold } from '../constants';

export const useGetUpgradePlanSiteMetrics = () => {
	const isEnglishLocale = useIsEnglishLocale();
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { data: siteMetricData } = useUrlBasicMetricsQuery( importSiteQueryParam );
	let showUpdatedSpeedMetrics = false;
	let lcpPercentageDifference = 0;

	if (
		isEnglishLocale &&
		siteMetricData?.basic?.lcp &&
		siteMetricData.basic.lcp > upgradePlanSiteMetricsLcpThreshold
	) {
		const lcpMsDiff = siteMetricData.basic.lcp - upgradePlanSiteMetricsLcpThreshold;
		lcpPercentageDifference = Math.round( ( lcpMsDiff / siteMetricData.basic.lcp ) * 100 );

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
