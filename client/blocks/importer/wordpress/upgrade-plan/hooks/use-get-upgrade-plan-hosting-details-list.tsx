import { useTranslate } from 'i18n-calypso';
import cwvtechReportJson from '../cwvtech-report.json';
import { useDefaultHostingDetails } from '../use-default-hosting-details';
import { useGetUpgradePlanSiteMetrics } from './use-get-upgrade-plan-site-metrics';

export const useUpgradePlanHostingDetailsList = () => {
	const translate = useTranslate();
	const { lcpPercentageDifference, fidPercentageDifference, isFetching } =
		useGetUpgradePlanSiteMetrics();

	const newHostingDetails = useDefaultHostingDetails();

	// LCP hosting details.
	if ( lcpPercentageDifference > 0 ) {
		const wordpressLCP = Math.floor( 100 * cwvtechReportJson[ 'WordPress.com' ].goodLCP );

		newHostingDetails[ 'higher-speed' ].description = translate(
			'%(wordpressLcpPercentage)s of sites on WordPress.com are at least %(sitePercentageDifference)s faster than yours.',
			{
				args: {
					wordpressLcpPercentage: `${ wordpressLCP }%`,
					sitePercentageDifference: `${ lcpPercentageDifference }%`,
				},
			}
		);
	}

	// FID hosting details.
	if ( fidPercentageDifference > 0 ) {
		const wordpressFID = Math.floor( 100 * cwvtechReportJson[ 'WordPress.com' ].goodFID );

		newHostingDetails[ 'faster-response' ].description = translate(
			'%(wordpressFidPercentage)s of sites on WordPress.com respond at least %(sitePercentageDifference)s faster than yours on the first interaction.',
			{
				args: {
					wordpressFidPercentage: `${ wordpressFID }%`,
					sitePercentageDifference: `${ fidPercentageDifference }%`,
				},
			}
		);
	}

	return {
		isFetching,
		list: Object.values( newHostingDetails ),
	};
};
