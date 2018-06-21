/** @format */

/**
 * Internal dependencies
 */
import { TYPE_FREE } from 'lib/plans/constants';

/**
 * No translate() used in this file since we're launching those promotions just for the EN audience
 */
export default [
	{
		name: 'june_2018',
		startsAt: new Date( 2018, 4, 26, 0, 0, 0 ),
		endsAt: new Date( 2018, 5, 30, 23, 59, 59 ),
		nudgeText: '20% Off All Plans',
		nudgeEndsTodayText: '20% Off (Ends Today)',
		plansPageNoticeText: 'Enter coupon code “JUNE20” during checkout to claim your 20% discount',
		targetPlan: { type: TYPE_FREE },
	},
];
