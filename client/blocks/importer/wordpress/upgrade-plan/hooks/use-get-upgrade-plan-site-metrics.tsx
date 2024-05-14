import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { getQueryArg } from '@wordpress/url';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import { upgradePlanSiteMetricsLcpThreshold } from '../constants';

export const useGetUpgradePlanSiteMetrics = () => {
	const isEnglishLocale = useIsEnglishLocale();
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { data: siteMetricData } = useUrlBasicMetricsQuery( importSiteQueryParam );
	let lcpPercentageDifference = 0;

	if (
		isEnglishLocale &&
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
	}

	return {
		siteMetricData,
		lcpPercentageDifference,
	};
};
