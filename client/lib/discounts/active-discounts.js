/** @format */

/**
 * Internal dependencies
 */
import {
	GROUP_JETPACK,
	GROUP_WPCOM,
	TYPE_FREE,
	TYPE_BLOGGER,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
} from 'lib/plans/constants';

/**
 * No translate() used on some of these since we're launching those promotions just for the EN audience
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
	{
		name: 'free_domain',
		plansPageNoticeTextTitle: 'Get a free domain name by upgrading to any plan listed below!',
		plansPageNoticeText:
			'Improve your SEO, branding, credibility, and even word-of-mouth marketing with a custom domain. All plan upgrades include a free domain name of your choice for one year.',
	},
	{
		name: 'sale_feb_2019',
		startsAt: new Date( 2019, 2, 4, 0, 0, 0 ),
		endsAt: new Date( 2019, 2, 8, 0, 0, 0 ),
		nudgeText: 'Sale! 20% off all plans',
		ctaText: 'Upgrade',
		plansPageNoticeText: 'Enter coupon code “MARCH20” at checkout to claim your 20% discount',
		targetPlans: [
			{ type: TYPE_FREE, group: GROUP_WPCOM },
			{ type: TYPE_BLOGGER, group: GROUP_WPCOM },
			{ type: TYPE_PERSONAL, group: GROUP_WPCOM },
			{ type: TYPE_PREMIUM, group: GROUP_WPCOM },
		],
	},
	{
		name: 'sale_feb_2019_jp',
		startsAt: new Date( 2019, 1, 25, 0, 0, 0 ),
		endsAt: new Date( 2019, 2, 8, 0, 0, 0 ),
		nudgeText: 'Sale! 20% off all plans',
		ctaText: 'Upgrade',
		plansPageNoticeText: 'Enter coupon code “JPSALE20” at checkout to claim your 20% discount',
		targetPlans: [
			{ type: TYPE_FREE, group: GROUP_JETPACK },
			{ type: TYPE_PERSONAL, group: GROUP_JETPACK },
			{ type: TYPE_PREMIUM, group: GROUP_JETPACK },
		],
	},
	// NOTE: These two (new_plans and default_plans_tab_business) should remain at the bottom.
	// It's a temporary hack and will be removed shortly.
	{
		name: 'new_plans',
		startsAt: new Date( 2018, 9, 25, 0, 0, 1 ),
		endsAt: new Date( 2120, 9, 26, 0, 0, 0 ),
	},
	{
		name: 'default_plans_tab_business',
		startsAt: new Date( 2018, 9, 25, 0, 0, 1 ),
		endsAt: new Date( 2120, 9, 26, 0, 0, 0 ),
	},
];
