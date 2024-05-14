import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { getQueryArg } from '@wordpress/url';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import {
	upgradePlanSiteMetricsLcpThreshold,
	upgradePlanSiteMetricsFidThreshold,
} from '../constants';

const calcPercentageDifferenceFromThreshold = ( value: number | undefined, threshold: number ) => {
	if ( ! value || value <= threshold ) {
		return 0;
	}

	return Math.round( 100 * Math.abs( ( value - threshold ) / ( ( value + threshold ) / 2 ) ) );
};

export const useGetUpgradePlanSiteMetrics = () => {
	const isEnglishLocale = useIsEnglishLocale();
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { data: siteMetricData } = useUrlBasicMetricsQuery( importSiteQueryParam );

	let lcpPercentageDifference = 0;
	let fidPercentageDifference = 0;

	if ( isEnglishLocale ) {
		lcpPercentageDifference = calcPercentageDifferenceFromThreshold(
			siteMetricData?.basic?.lcp,
			upgradePlanSiteMetricsLcpThreshold
		);

		fidPercentageDifference = calcPercentageDifferenceFromThreshold(
			siteMetricData?.basic?.fid,
			upgradePlanSiteMetricsFidThreshold
		);
	}

	return {
		siteMetricData,
		lcpPercentageDifference,
		fidPercentageDifference,
	};
};
