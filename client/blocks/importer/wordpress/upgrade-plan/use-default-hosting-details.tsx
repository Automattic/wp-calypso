import { next, trendingUp, chartBar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import cwvtechReportJson from './cwvtech-report.json';
import type { ReactNode } from 'react';

type DefaultHostingDetails = {
	[ key: string ]: {
		title: string;
		description: string | ReactNode;
		icon: JSX.Element;
	};
};

const higherSpeedPercentage = Math.floor(
	( cwvtechReportJson[ 'WordPress.com' ].goodLCP - cwvtechReportJson[ 'WordPress' ].goodLCP ) * 100
);

const fastResponsePercentage = Math.floor( cwvtechReportJson[ 'WordPress.com' ].goodFID * 100 );

const wpcomPercentageUptime = '99.99';
const otherHostsPercentageUptime = '99.85';

export const useDefaultHostingDetails = (): DefaultHostingDetails => {
	const translate = useTranslate();

	return {
		'higher-speed': {
			title: translate( 'Higher speed' ),
			description: translate(
				'WordPress.com has %(higherSpeedPercentage)d%% more sites that display fast compared to other WordPress hosts.',
				{
					args: { higherSpeedPercentage },
				}
			),
			icon: trendingUp,
		},
		'faster-response': {
			title: translate( 'Faster response' ),
			description: translate(
				'%(fastResponsePercentage)d%% of sites on WordPress.com respond within 0.1 seconds on the first interaction.',
				{
					args: { fastResponsePercentage },
				}
			),
			icon: next,
		},
		'higher-availability': {
			title: translate( 'Higher availability' ),
			description: translate(
				'WordPress.com boasts a %(wpcomPercentageUptime)s%% uptime, compared to %(otherHostsPercentageUptime)s%% uptime for other WordPress hosts.',
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
