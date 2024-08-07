import { next, trendingUp, chartBar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import cwvtechReportJson from './cwvtech-report.json';
import type { HostingDetails } from './types';

const higherSpeedPercentage = Math.floor(
	( cwvtechReportJson[ 'WordPress.com' ].goodLCP - cwvtechReportJson[ 'WordPress' ].goodLCP ) * 100
);

const fastResponsePercentage = Math.floor( cwvtechReportJson[ 'WordPress.com' ].goodFID * 100 );

const wpcomPercentageUptime = '99.99';
const otherHostsPercentageUptime = '99.85';

export const useDefaultHostingDetails = (): HostingDetails => {
	const translate = useTranslate();

	return {
		'higher-speed': {
			title: translate( 'Faster loading' ),
			description: translate(
				'WordPress.com has %(higherSpeedPercentage)d%% more sites with ultra-fast, sub-100ms loading times versus other WordPress hosts.',
				{
					args: { higherSpeedPercentage },
				}
			),
			icon: trendingUp,
		},
		'faster-response': {
			title: translate( 'Quicker response' ),
			description: translate(
				'%(fastResponsePercentage)d%% of sites on WordPress.com respond within 0.1 seconds of the first interaction.',
				{
					args: { fastResponsePercentage },
				}
			),
			icon: next,
		},
		'higher-availability': {
			title: translate( 'Better availability' ),
			description: translate(
				'WordPress.com sites have %(wpcomPercentageUptime)s%% uptime, compared to the %(otherHostsPercentageUptime)s%% uptime of other WordPress hosts.',
				{
					args: {
						wpcomPercentageUptime,
						otherHostsPercentageUptime,
					},
				}
			),
			icon: chartBar,
		},
	};
};
