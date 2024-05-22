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

const fasterResponsePercentage = Math.round( cwvtechReportJson[ 'WordPress.com' ].goodFID * 100 );

const higherAvailabilityPercentage = 3;

export const useDefaultHostingDetails = (): DefaultHostingDetails => {
	const translate = useTranslate();

	return {
		'higher-speed': {
			title: translate( 'Higher speed' ),
			description:
				translate( '%(higherSpeedPercentage)d 30% faster.', {
					args: { higherSpeedPercentage },
				} ) + '*',
			icon: trendingUp,
		},
		'faster-response': {
			title: translate( 'Faster response' ),
			description: translate(
				'%(fasterResponsePercentage)d% of sites on WordPress.com have a fast response.',
				{
					args: { fasterResponsePercentage },
				}
			),
			icon: next,
		},
		'higher-availability': {
			title: translate( 'Higher availability' ),
			description:
				translate( '%(higherAvailabilityPercentage)d% better uptime.', {
					args: { higherAvailabilityPercentage },
				} ) + '*',
			icon: chartBar,
		},
	};
};
