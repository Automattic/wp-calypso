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
				'%(higherSpeedPercentage)d%% of sites on WordPress.com renders the largest image or text block visible in the viewport within 2500 milliseconds, in accordance with Google recommendations.',
				{
					args: { higherSpeedPercentage },
				}
			),
			icon: trendingUp,
		},
		'faster-response': {
			title: translate( 'Faster response' ),
			description: translate(
				'%(fastResponsePercentage)d%% of sites on WordPress.com respond within 100 milliseconds on the first interaction, in accordance with Google recommendations.',
				{
					args: { fastResponsePercentage },
				}
			),
			icon: next,
		},
		'higher-availability': {
			title: translate( 'Higher availability' ),
			description: translate(
				'WordPress.com has %(wpcomMinutesDowntime)s downtime, compared to %(otherHostsAverageDowntime)d minutes per month for other WordPress hosts.',
				{
					args: {
						wpcomMinutesDowntime:
							0 === wpcomMinutesDowntime ? translate( 'zero' ) : wpcomMinutesDowntime,
						otherHostsAverageDowntime,
					},
				}
			),
			icon: chartBar,
		},
	};
};
