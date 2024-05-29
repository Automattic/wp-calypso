import { getQueryArg } from '@wordpress/url';
import { useUrlBasicMetricsQuery } from 'calypso/data/site-profiler/use-url-basic-metrics-query';
import {
	upgradePlanSiteMetricsLcpThreshold,
	upgradePlanSiteMetricsFidThreshold,
} from '../constants';

const calcPercentageDifferenceFromThreshold = ( value: number, threshold: number ) => {
	if ( ! value || value <= threshold ) {
		return 0;
	}

	const diff = value - threshold;
	return Math.round( ( diff / value ) * 100 );
};

export const useGetUpgradePlanSiteMetrics = () => {
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { data: siteMetricData, isFetching } = useUrlBasicMetricsQuery( importSiteQueryParam );

	let lcpPercentageDifference = 0;
	let fidPercentageDifference = 0;

	lcpPercentageDifference = calcPercentageDifferenceFromThreshold(
		siteMetricData?.basic?.lcp?.value ?? 0,
		upgradePlanSiteMetricsLcpThreshold
	);

	fidPercentageDifference = calcPercentageDifferenceFromThreshold(
		siteMetricData?.basic?.fid?.value ?? 0,
		upgradePlanSiteMetricsFidThreshold
	);

	return {
		isFetching,
		siteMetricData,
		lcpPercentageDifference,
		fidPercentageDifference,
	};
};
