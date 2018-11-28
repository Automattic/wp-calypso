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
	TYPE_BUSINESS,
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
		name: 'early_renewal_offer',
		startsAt: new Date( 2018, 11, 5, 0, 0, 0 ),
		endsAt: new Date( 2018, 11, 18, 23, 59, 59 ),
		nudgeText: translate( 'Renew now to save on domain prices' ),
		ctaText: translate( 'Renew' ),
		plansPageNoticeText: translate(
			'Renew now to lock in your existing prices for your domain and plan.'
		),
		targetPlans: [
			{ type: TYPE_PERSONAL, group: GROUP_WPCOM },
			{ type: TYPE_PREMIUM, group: GROUP_WPCOM },
			{ type: TYPE_BUSINESS, group: GROUP_WPCOM },
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
