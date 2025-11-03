import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import {
	tool,
	currencyDollar,
	commentAuthorName,
	pages,
	people,
	store,
	commentAuthorAvatar,
	starHalf,
	envelope,
	payment,
	trendingUp,
} from '@wordpress/icons';
import type { TierItem } from './types';

const TARGET_INFLUENCED_REVENUE = {
	'emerging-partner': 0,
	'agency-partner': 1000,
	'pro-agency-partner': 5000,
	'premier-partner': 250000,
};

export const ALL_TIERS: TierItem[] = [
	{
		level: 0,
		id: 'emerging-partner',
		name: __( 'Account activated' ),
		description: 'Joining the program',
		heading: __( 'Essential benefits' ),
		subheading: __( 'Tools, earning opportunities, support & training and more' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'agency-partner' ],
		benefits: [
			{
				icon: tool,
				title: __( 'Tools & Platforms' ),
				description: __(
					'Intuitive agency dashboard for streamlined client billing, and client and product management.'
				),
				actions: [
					{
						id: 'manage-sites',
						label: __( 'Manage sites' ),
						href: '/sites',
					},
					{
						id: 'create-client-reports',
						label: __( 'Create client reports' ),
						href: '/reports',
					},
					{
						id: 'manage-purchases',
						label: __( 'Manage purchase' ),
						href: '/purchases',
					},
				],
			},
			{
				icon: currencyDollar,
				title: __( 'Earning Opportunities' ),
				description: __(
					'All partners get access to referral and reseller earning opportunities across all of Automattic’s suite of products. Premier partners receive the highest earning opportunities.'
				),
				actions: [
					{
						id: 'make-client-referral',
						label: __( 'Make a client referral' ),
						href: '/referrals/dashboard',
					},
					{
						id: 'add-woopayments-to-store',
						label: __( 'Add WooPayments to a store' ),
						href: '/woopayments',
					},
				],
			},
			{
				icon: commentAuthorName,
				title: __( 'Support' ),
				description: __(
					'All program partners receive unified program and product support. Pro partners receive access to priority support across Automattic products. Premier partners receive the highest level of support and escalation.'
				),
				actions: [
					{
						id: 'contact-support',
						label: __( 'Contact support' ),
						href: '#contact-support',
					},
				],
			},
			{
				icon: pages,
				title: __( 'Training & Resources' ),
				description: __(
					'Foundational product training, education and best practices on growing your agency, marketing materials, and advanced sales training. Pro partners eligible to receive advanced sales training and strategic consulting upon request.'
				),
				status: __( 'Coming Soon' ),
			},
			{
				icon: people,
				title: __( 'Networking & Community' ),
				description: __(
					'Access Automattic’s community platforms and network with like-minded agencies.'
				),
				status: __( 'Coming Soon' ),
			},
		],
	},
	{
		level: 1,
		id: 'agency-partner',
		name: __( 'Agency Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'agency-partner' ], 'USD' )
		),
		heading: __( '2 additional benefits unlocked' ),
		subheading: __( 'Directory visibility, early access' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'pro-agency-partner' ],
		benefits: [
			{
				icon: commentAuthorAvatar,
				title: __( 'Directory Visibility & Badging' ),
				description: __(
					'Eligible for inclusion in Automattic’s agency directories and increased exposure to potential clients.'
				),
				actions: [
					{
						id: 'manage-profile',
						label: __( 'Manage your profile' ),
						href: '/partner-directory/dashboard',
					},
					{
						id: 'download-badge',
						label: __( 'Download your badges' ),
					},
				],
			},
			{
				icon: store,
				title: __( 'Early Access' ),
				description: __(
					'Early access to new Automattic products and features (as available), and opportunities to contribute to the product roadmap.'
				),
			},
		],
	},
	{
		level: 2,
		id: 'pro-agency-partner',
		name: __( 'Pro Agency Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'pro-agency-partner' ], 'USD' )
		),
		heading: __( '3 additional benefits unlocked' ),
		subheading: __( 'Co-marketing, qualified leads, partner manager & more' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'premier-partner' ],
		benefits: [
			{
				icon: starHalf,
				title: __( 'Co-Marketing' ),
				description: __(
					'Pro Agency Partners are eligible to participate in co-marketing activities with Automattic and our suite of brands, including case studies, co-branded campaigns, and other marketing opportunities as they arise.'
				),
			},
			{
				icon: envelope,
				title: __( 'Pre-qualified sales leads' ),
				description: __(
					'Pro Partners eligible to receive pre-qualified leads from Automattic sales teams when opportunities arise as well as leads generated through agency directory listings.'
				),
			},
			{
				icon: commentAuthorName,
				title: __( 'Dedicated agency partner manager' ),
				description: __(
					'Pro partners receive access to an assigned agency partner manager for strategic guidance.'
				),
				actions: [
					{
						id: 'schedule-call',
						label: __( 'Book time with your partner manager' ),
					},
				],
			},
		],
	},
	{
		level: 3,
		id: 'premier-partner',
		name: __( 'Premier Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'premier-partner' ], 'USD' )
		),
		heading: __( '3 premium benefits' ),
		subheading: __( 'Annual credits, Parse.ly trial, marketing funds' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'premier-partner' ],
		benefits: [
			{
				icon: payment,
				title: __( 'Annual Credit for WooCommerce and Jetpack Extensions' ),
				description: __(
					'Premier partners receive annual credits toward WooCommerce and Jetpack premium extensions for agency and client sites.'
				),
			},
			{
				icon: trendingUp,
				title: __( 'Free three-month Parse.ly trial' ),
				description: __(
					'Premier partners receive complimentary access to Parse.ly’s content analytics platform for three months to optimize content strategy.'
				),
			},
			{
				icon: currencyDollar,
				title: __( 'Marketing development funds' ),
				description: __(
					'Premier partners can access marketing development funds upon successful application to support co-marketing initiatives and agency growth.'
				),
			},
		],
	},
];
