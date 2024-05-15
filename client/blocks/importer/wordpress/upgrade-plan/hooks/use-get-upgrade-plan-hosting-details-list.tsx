import { trendingUp, next } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { defaultHostingDetails } from '../constants';
import wordpressCwvtechReportJson from '../wordpress-cwvtech-report.json';
import { useGetUpgradePlanSiteMetrics } from './use-get-upgrade-plan-site-metrics';

export const useUpgradePlanHostingDetailsList = () => {
	const translate = useTranslate();
	const { lcpPercentageDifference, fidPercentageDifference } = useGetUpgradePlanSiteMetrics();

	let newDefaultHostingDetails = [ ...defaultHostingDetails ];
	const newHostingDetails = [];

	// LCP hosting details.
	if ( lcpPercentageDifference > 0 ) {
		const wordpressLCP = Math.floor( 100 * wordpressCwvtechReportJson?.goodLCP );

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
		newDefaultHostingDetails = newDefaultHostingDetails.filter(
			( { id } ) => id !== 'increased-speed'
		);
		newHostingDetails.push( updatedHostingSpeedDetails );
	}

	// FID hosting details.
	if ( fidPercentageDifference > 0 ) {
		const wordpressFID = Math.floor( 100 * wordpressCwvtechReportJson?.goodFID );

		const updatedHostingFasterResponseDetails = {
			title: translate( 'Faster response' ),
			description: translate(
				'%(wordpressFidPercentage)s of sites on WordPress.com respond at least %(sitePercentageDifference)s faster than yours on the first interaction.',
				{
					args: {
						wordpressFidPercentage: `${ wordpressFID }%`,
						sitePercentageDifference: `${ fidPercentageDifference }%`,
					},
				}
			),
			icon: next,
		};
		newDefaultHostingDetails = newDefaultHostingDetails.filter(
			( { id } ) => id !== 'reduced-error-rate'
		);
		newHostingDetails.push( updatedHostingFasterResponseDetails );
	}

	return [ ...newHostingDetails, ...newDefaultHostingDetails ];
};
