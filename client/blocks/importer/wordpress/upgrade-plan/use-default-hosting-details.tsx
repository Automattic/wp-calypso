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

const higherSpeedPercentage = Math.round(
	( cwvtechReportJson[ 'WordPress.com' ].goodLCP - cwvtechReportJson[ 'WordPress' ].goodLCP ) * 100
);

const fastResponsePercentage = Math.round( cwvtechReportJson[ 'WordPress.com' ].goodFID * 100 );

const wpcomMinutesDowntime = 0;
const otherHostsAverageDowntime = 63;

export const useDefaultHostingDetails = (): DefaultHostingDetails => {
	const translate = useTranslate();

	return {
		'higher-speed': {
			title: translate( 'Higher speed' ),
			description: translate(
				'%(higherSpeedPercentage)d%% more sites on WordPress.com are fast compared to other WordPress hosts.',
				{
					args: { higherSpeedPercentage },
				}
			),
			icon: trendingUp,
		},
		'faster-response': {
			title: translate( 'Faster response' ),
			description: translate(
				'%(fastResponsePercentage)d%% of sites on WordPress.com respond fast, in accordance with Google recommendations.',
				{
					args: { fastResponsePercentage },
				}
			),
			icon: next,
		},
		'higher-availability': {
			title: translate( 'Higher availability' ),
			description: translate(
				'WordPress.com has %(wpcomMinutesDowntime)d minutes downtime, versus %(otherHostsAverageDowntime)d minutes from other WordPress hosts per month.',
				{
					args: { wpcomMinutesDowntime, otherHostsAverageDowntime },
				}
			),
			icon: chartBar,
		},
	};
};
