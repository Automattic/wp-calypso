import { useIsEnglishLocale } from '@automattic/i18n-utils';
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
	const isEnglishLocale = useIsEnglishLocale();
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { data: siteMetricData } = useUrlBasicMetricsQuery( importSiteQueryParam );

	let showUpdatedSpeedMetrics = false;
	let lcpPercentageDifference = 0;
	let fidPercentageDifference = 0;

	if ( isEnglishLocale ) {
		lcpPercentageDifference = calcPercentageDifferenceFromThreshold(
			siteMetricData?.basic?.lcp?.value ?? 0,
			upgradePlanSiteMetricsLcpThreshold
		);

		fidPercentageDifference = calcPercentageDifferenceFromThreshold(
			siteMetricData?.basic?.fid?.value ?? 0,
			upgradePlanSiteMetricsFidThreshold
		);
	}

	if ( lcpPercentageDifference > 0 || fidPercentageDifference > 0 ) {
		showUpdatedSpeedMetrics = true;
	}

	return {
		showUpdatedSpeedMetrics,
		siteMetricData,
		lcpPercentageDifference,
		fidPercentageDifference,
	};
};
