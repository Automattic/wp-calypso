/** @format */

/**
 * Internal dependencies
 */
import {
	GROUP_JETPACK,
	GROUP_WPCOM,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
} from 'lib/plans/constants';

/**
 * No translate() used in this file since we're launching those promotions just for the EN audience
 */
export default [
	{
		name: 'simple_payments_wpcom',
		startsAt: new Date( 2018, 6, 9, 0, 0, 0 ),
		endsAt: new Date( 2018, 8, 9, 23, 59, 59 ),
		plansPageNoticeText:
			'Upgrade to a Premium or Business plan today and start collecting payments with the Simple Payments button!',
		targetPlans: [
			{ type: TYPE_FREE, group: GROUP_WPCOM },
			{ type: TYPE_PERSONAL, group: GROUP_WPCOM },
		],
	},
	{
		name: 'simple_payments_jetpack',
		startsAt: new Date( 2018, 6, 9, 0, 0, 0 ),
		endsAt: new Date( 2018, 8, 9, 23, 59, 59 ),
		plansPageNoticeText:
			'Upgrade to a Premium or Professional plan today and start collecting payments with the Simple Payments button!',
		targetPlans: [
			{ type: TYPE_FREE, group: GROUP_JETPACK },
			{ type: TYPE_PERSONAL, group: GROUP_JETPACK },
		],
	},
	{
		name: 'renewing_plan',
		startsAt: new Date( 2018, 6, 11, 0, 0, 0 ),
		endsAt: new Date( 2018, 6, 16, 23, 59, 59 ),
		plansPageNoticeText:
			'Enter coupon code YOURGIFT30 during checkout to redeem your 30% off discount!',
		targetPlans: [
			{ type: TYPE_PERSONAL, group: GROUP_WPCOM },
			{ type: TYPE_PREMIUM, group: GROUP_WPCOM },
		],
	},
];
