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
} from 'calypso/lib/plans/constants';

const simplePaymentsNoticeTextWPCOM =
	'Upgrade to a Premium or Business plan today and start collecting payments with the Pay with PayPal button!';

const simplePaymentsNoticeTextJetpack =
	'Upgrade to a Premium or Professional plan today and start collecting payments with the Pay with PayPal button!';

/**
 * No translate() used on some of these since we're launching those promotions just for the EN audience
 */
export default [
	{
		name: 'simple_payments_wpcom',
		startsAt: new Date( 2018, 6, 9, 0, 0, 0 ),
		endsAt: new Date( 2018, 8, 9, 23, 59, 59 ),
		plansPageNoticeText: simplePaymentsNoticeTextWPCOM,
		targetPlans: [
			{ type: TYPE_FREE, group: GROUP_WPCOM },
			{ type: TYPE_PERSONAL, group: GROUP_WPCOM },
		],
	},
	{
		name: 'simple_payments_jetpack',
		startsAt: new Date( 2018, 6, 9, 0, 0, 0 ),
		endsAt: new Date( 2018, 8, 9, 23, 59, 59 ),
		plansPageNoticeText: simplePaymentsNoticeTextJetpack,
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
		name: 'sale_wpsave20',
		startsAt: new Date( 2019, 1, 1, 0, 0, 0 ),
		endsAt: new Date( 2099, 1, 1, 0, 0, 0 ), //evergreen
		plansPageNoticeText: 'Enter coupon code “WPSAVE20” at checkout to claim your 20% discount',
		targetPlans: [
			{ type: TYPE_FREE, group: GROUP_WPCOM },
			{ type: TYPE_BLOGGER, group: GROUP_WPCOM },
			{ type: TYPE_PERSONAL, group: GROUP_WPCOM },
			{ type: TYPE_PREMIUM, group: GROUP_WPCOM },
		],
	},
	{
		name: 'sale_wpsave20_jp',
		startsAt: new Date( 2019, 1, 1, 0, 0, 0 ),
		endsAt: new Date( 2099, 1, 1, 0, 0, 0 ), //evergreen
		plansPageNoticeText: 'Enter coupon code “JPSALE20” at checkout to claim your 20% discount',
		targetPlans: [
			{ type: TYPE_FREE, group: GROUP_JETPACK },
			{ type: TYPE_PERSONAL, group: GROUP_JETPACK },
			{ type: TYPE_PREMIUM, group: GROUP_JETPACK },
		],
	},
	{
		name: 'sale_julybusiness40',
		startsAt: new Date( '2019-07-22 00:00:00' ),
		endsAt: new Date( '2019-07-25 23:59:59' ),
		plansPageNoticeText:
			'Enter coupon code "JULYBUSINESS40" at checkout to save 40% on a Business plan site upgrade',
		targetPlans: [
			{ type: TYPE_FREE, group: GROUP_WPCOM },
			{ type: TYPE_BLOGGER, group: GROUP_WPCOM },
			{ type: TYPE_PERSONAL, group: GROUP_WPCOM },
			{ type: TYPE_PREMIUM, group: GROUP_WPCOM },
		],
	},
	{
		name: 'plans_no_tabs',
		startsAt: new Date( 2018, 2, 7, 0, 0, 0 ),
		endsAt: new Date( 2120, 9, 26, 0, 0, 0 ),
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
