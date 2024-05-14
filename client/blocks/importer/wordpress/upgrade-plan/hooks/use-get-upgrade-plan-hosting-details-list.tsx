import { trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { defaultHostingDetails } from '../constants';
import wordpressCwvtechReportJson from '../wordpress-cwvtech-report.json';
import { useGetUpgradePlanSiteMetrics } from './use-get-upgrade-plan-site-metrics';

export const useUpgradePlanHostingDetailsList = () => {
	const translate = useTranslate();
	const { lcpPercentageDifference } = useGetUpgradePlanSiteMetrics();
	const hostingDetails = [ ...defaultHostingDetails ];

	if ( lcpPercentageDifference > 0 ) {
		const wordpressLCP = Math.round( 100 * wordpressCwvtechReportJson?.goodLCP );

		const updatedHostingSpeedDetails = {
			title: translate( 'Higher speed' ),
			description: translate(
				'%(wordpressLcpPercentage)s of sites on WordPress.com are at least %(sitePercentageDifference)s faster than yours.',
				{
					args: {
						wordpressLcpPercentage: `${ wordpressLCP }%`,
						sitePercentageDifference: `${ lcpPercentageDifference }%`,
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
