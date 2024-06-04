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
		const goodLCPercentage = Math.floor( 100 * cwvtechReportJson[ 'WordPress.com' ].goodLCP );

		newHostingDetails[ 'higher-speed' ].description = translate(
			'%(goodLCPercentage)d%% of sites on WordPress.com are at least %(lcpPercentageDifference)d%% faster than yours.',
			{
				args: {
					goodLCPercentage,
					lcpPercentageDifference,
				},
			}
		);
	}

	// FID hosting details.
	if ( fidPercentageDifference > 0 ) {
		const goodFIDPercentage = Math.floor( 100 * cwvtechReportJson[ 'WordPress.com' ].goodFID );

		newHostingDetails[ 'faster-response' ].description = translate(
			'%(goodFIDPercentage)d%% of sites on WordPress.com respond at least %(fidPercentageDifference)d%% faster than yours on the first interaction.',
			{
				args: {
					goodFIDPercentage,
					fidPercentageDifference,
				},
			}
		);
	}

	return {
		isFetching,
		list: Object.values( newHostingDetails ),
	};
};
