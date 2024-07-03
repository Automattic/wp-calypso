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
			'WordPress.com sites are %(lcpPercentageDifference)d%% faster than your current one, with %(goodLCPercentage)d%% more sites loading in under 100ms.',
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
			'WordPress.com sites respond %(fidPercentageDifference)d%% faster than yours, with %(goodFIDPercentage)d%% of sites responding within 0.1 seconds of the first interaction.',
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
