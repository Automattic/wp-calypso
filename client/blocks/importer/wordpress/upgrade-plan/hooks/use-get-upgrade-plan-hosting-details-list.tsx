import { trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { defaultHostingDetails, upgradePlanSiteMetricsLcpThreshold } from '../constants';
import wordpressCwvtechReportJson from '../wordpress-cwvtech-report.json';
import { UseGetUpgradePlanSiteMetrics } from './use-get-upgrade-plan-site-metrics';

export const useUpgradePlanHostingDetailsList = () => {
	const translate = useTranslate();
	const { siteMetricData, showUpdatedSpeedMetrics } = UseGetUpgradePlanSiteMetrics();
	const hostingDetails = [ ...defaultHostingDetails ];

	if ( showUpdatedSpeedMetrics ) {
		const wordpressLCP = Math.round( 100 * wordpressCwvtechReportJson?.goodLCP );
		const percentageDifference =
			siteMetricData?.basic?.lcp &&
			Math.round(
				100 *
					Math.abs(
						( siteMetricData?.basic?.lcp - upgradePlanSiteMetricsLcpThreshold ) /
							( ( siteMetricData?.basic?.lcp + upgradePlanSiteMetricsLcpThreshold ) / 2 )
					)
			);

		if ( percentageDifference && percentageDifference < 1 ) {
			return hostingDetails;
		}

		const updatedHostingSpeedDetails = {
			title: translate( 'Higher speed' ),
			description: translate(
				'%(wordpressLcpPercentage)s of sites on WordPress.com are at least %(sitePercentageDifference)s faster than yours.',
				{
					args: {
						wordpressLcpPercentage: `${ wordpressLCP }%`,
						sitePercentageDifference: `${ percentageDifference }%`,
					},
				}
			),
			icon: trendingUp,
		};
		hostingDetails.splice( 1, 1 );
		hostingDetails.unshift( updatedHostingSpeedDetails );
	}

	return hostingDetails;
};
