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
import { translate } from 'i18n-calypso';

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
		name: 'october25',
		startsAt: new Date( 2018, 9, 18, 0, 0, 0 ),
		endsAt: new Date( 2018, 9, 25, 0, 0, 0 ),
		nudgeText: '20% Off All Plans',
		ctaText: translate( 'Upgrade' ),
		plansPageNoticeText: translate(
			'Enter coupon code “%(coupon)s” during checkout to claim your %(discount)d%% discount.',
			{
				args: {
					coupon: 'OCTOBER20',
					discount: 20,
				},
			}
		),
		targetPlans: [ { type: TYPE_FREE }, { type: TYPE_PERSONAL }, { type: TYPE_PREMIUM } ],
	},
	{
		name: 'october25',
		startsAt: new Date( 2018, 9, 25, 0, 0, 1 ),
		endsAt: new Date( 2018, 9, 26, 0, 0, 0 ),
		nudgeText: 'Last chance: 20% Off',
		ctaText: translate( 'Upgrade' ),
		plansPageNoticeText: translate(
			'Sale ends today! Enter coupon code “%(coupon)s” during checkout to claim your %(discount)d%% discount.',
			{
				args: {
					coupon: 'OCTOBER20',
					discount: 20,
				},
			}
		),
		targetPlans: [ { type: TYPE_FREE }, { type: TYPE_PERSONAL }, { type: TYPE_PREMIUM } ],
	},
	{
		name: 'blackfriday30',
		startsAt: new Date( 2018, 10, 21, 0, 0, 0 ),
		endsAt: new Date( 2018, 10, 24, 0, 0, 0 ),
		nudgeText: 'Black Friday 30% Off Plans!',
		ctaText: translate( 'Upgrade' ),
		plansPageNoticeText: 'Black Friday 30% Off! Enter “BLACKFRIDAY30” At Checkout',
		targetPlans: [ { type: TYPE_FREE }, { type: TYPE_PERSONAL }, { type: TYPE_PREMIUM } ],
	},
	{
		name: 'cyber30',
		startsAt: new Date( 2018, 10, 26, 0, 0, 0 ),
		endsAt: new Date( 2018, 10, 27, 0, 0, 0 ),
		nudgeText: 'Last Chance – 30% Off Plans',
		ctaText: translate( 'Upgrade' ),
		plansPageNoticeText:
			'Hurry! Cyber Monday 30% Off Sale Is Almost Over. Enter CYBER30 At Checkout',
		targetPlans: [ { type: TYPE_FREE }, { type: TYPE_PERSONAL }, { type: TYPE_PREMIUM } ],
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
	{
		name: 'plans_no_tabs',
		startsAt: new Date( 2018, 2, 7, 0, 0, 0 ),
		endsAt: new Date( 2120, 9, 26, 0, 0, 0 ),
	},
];
