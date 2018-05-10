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
		name: 'mothers_day_2018',
		startsAt: new Date( 2018, 4, 9, 0, 0, 0 ),
		endsAt: new Date( 2018, 4, 13, 23, 59, 59 ),
		nudgeText: '30% Off All Plans',
		nudgeEndsTodayText: '30% Off (Ends Today)',
		plansPageNoticeText:
			'Enter coupon code “MOTHERSDAY30” during checkout to claim your 30% discount',
		targetPlan: { type: TYPE_FREE },
	},
];
