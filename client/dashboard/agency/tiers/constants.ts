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
	megaphone,
} from '@wordpress/icons';
import { getReportAllowance } from '../amplify/constants';
import type { Benefit, TierItem } from './types';
import type { AgencyTierId } from '@automattic/api-core';

/**
 * Upgrade incentive on higher tiers' cards: the bigger monthly allowance.
 * Gated on the same link as the essential row, so agencies without access
 * don't see it.
 */
function prospectReportsAllowanceBenefit( tierId: AgencyTierId ): Benefit {
	return {
		icon: megaphone,
		title: sprintf(
			/* translators: %d is the number of Prospect Reports an agency can create each month */
			__( '%d Prospect Reports a month' ),
			getReportAllowance( tierId )
		),
		description: __( 'Audit more prospects every month and keep your sales pipeline full.' ),
		requiresLink: 'generate-prospect-report',
		isUpgradeOnly: true,
	};
}

export const TARGET_INFLUENCED_REVENUE = {
	'emerging-partner': 0,
	'agency-partner': 1200,
	'pro-agency-partner': 5000,
	'vip-pro-agency-partner': 100000,
	'premier-partner': 250000,
};

export const ALL_TIERS: TierItem[] = [
	{
		level: 0,
		id: 'emerging-partner',
		name: __( 'Account activated' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( 'Under %s influenced revenue' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'agency-partner' ], 'USD', { stripZeros: true } )
		),
		heading: __( 'Essential benefits' ),
		subheading: __( 'Tools, Prospect Reports, earning opportunities, support & training and more' ),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'agency-partner' ],
		progressCardDescription: __(
			"You're just getting started. Explore your benefits and learn how to grow your influenced revenue."
		),
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
					},
					{
						id: 'create-client-reports',
						label: __( 'Create Client Reports' ),
					},
					{
						id: 'manage-purchases',
						label: __( 'Manage purchase' ),
					},
				],
			},
			{
				id: 'prospect-reports',
				icon: megaphone,
				title: __( 'Prospect Reports' ),
				description: __(
					'Win more business by auditing a prospect’s homepage, spotting the problems, and pitching the fixes.'
				),
				requiresLink: 'generate-prospect-report',
				actions: [
					{
						id: 'generate-prospect-report',
						label: __( 'Generate a report' ),
					},
					{
						id: 'view-prospect-reports',
						label: __( 'View reports' ),
					},
				],
			},
			{
				icon: currencyDollar,
				title: __( 'Earning Opportunities' ),
				description: __(
					"All partners get access to referral and reseller earning opportunities across all of Automattic's suite of products. Premier partners receive the highest earning opportunities."
				),
				actions: [
					{
						id: 'make-client-referral',
						label: __( 'Make a client referral' ),
					},
					{
						id: 'add-woopayments-to-store',
						label: __( 'Add WooPayments to a store' ),
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
					"Access Automattic's community platforms and network with like-minded agencies."
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
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'agency-partner' ], 'USD', { stripZeros: true } )
		),
		heading: __( '2 additional benefits unlocked' ),
		subheading: sprintf(
			/* translators: %d is the number of Prospect Reports an agency can create each month */
			__(
				'Directory inclusion, %d Prospect Reports per month, and early access to product & feature improvements'
			),
			getReportAllowance( 'agency-partner' )
		),
		progressCardDescription: __(
			"You're making great progress! Keep growing your influenced revenue to unlock Pro Partner benefits."
		),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'pro-agency-partner' ],
		benefits: [
			{
				icon: commentAuthorAvatar,
				title: __( 'Directory Visibility & Badging' ),
				description: __(
					"Eligible for inclusion in Automattic's agency directories and increased exposure to potential clients."
				),
				actions: [
					{
						id: 'manage-profile',
						label: __( 'Manage your profile' ),
					},
					{
						id: 'download-badge',
						label: __( 'Download your badges' ),
					},
				],
			},
			{
				icon: store,
				title: __( 'Early access' ),
				description: __(
					'Early access to new Automattic products and features (as available), and opportunities to contribute to the product roadmap.'
				),
			},
			prospectReportsAllowanceBenefit( 'agency-partner' ),
		],
	},
	{
		level: 2,
		id: 'pro-agency-partner',
		name: __( 'Pro Agency Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'pro-agency-partner' ], 'USD', {
				stripZeros: true,
			} )
		),
		heading: __( '3 additional benefits unlocked' ),
		subheading: sprintf(
			/* translators: %d is the number of Prospect Reports an agency can create each month */
			__( 'Co-Marketing, qualified leads, partner manager, %d Prospect Reports per month & more' ),
			getReportAllowance( 'pro-agency-partner' )
		),
		progressCardDescription: __(
			"Congratulations! You've unlocked all Pro Partner benefits including Co-Marketing opportunities and your dedicated partner manager."
		),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'premier-partner' ],
		benefits: [
			{
				icon: starHalf,
				title: __( 'Co-Marketing' ),
				description: __(
					'Pro Agency Partners are eligible to participate in Co-Marketing activities with Automattic and our suite of brands, including case studies, co-branded campaigns, and other marketing opportunities as they arise.'
				),
			},
			{
				icon: envelope,
				title: __( 'Pre-qualified sales leads' ),
				description: __(
					'Pro Partners are eligible to receive pre-qualified leads from Automattic sales teams in addition to leads generated through agency directory listings.'
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
			prospectReportsAllowanceBenefit( 'pro-agency-partner' ),
		],
	},
	{
		level: 3,
		id: 'vip-pro-agency-partner',
		name: __( 'VIP Pro Agency Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue and invitation to the tier.' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'vip-pro-agency-partner' ], 'USD', {
				stripZeros: true,
			} )
		),
		heading: __( '2 additional benefits unlocked' ),
		subheading: sprintf(
			/* translators: %d is the number of Prospect Reports an agency can create each month */
			__( 'Higher VIP referral commissions, annual credits, and %d Prospect Reports per month' ),
			getReportAllowance( 'vip-pro-agency-partner' )
		),
		progressCardDescription: __(
			"Congratulations! You've unlocked higher VIP referral commissions, and annual credits for WooCommerce and Jetpack extensions."
		),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'vip-pro-agency-partner' ],
		benefits: [
			{
				icon: currencyDollar,
				title: __( 'Higher commissions for WordPress VIP referrals' ),
				description: __(
					'WordPress VIP Pro partners are eligible for a 15% one-time commission on successful WordPress VIP referrals.'
				),
			},
			{
				icon: payment,
				title: __( 'Annual Credit for WooCommerce and Jetpack extensions' ),
				description: __(
					'WordPress VIP Pro partners receive annual credits toward WooCommerce and Jetpack premium extensions for agency and client sites.'
				),
			},
			prospectReportsAllowanceBenefit( 'vip-pro-agency-partner' ),
		],
	},
	{
		level: 4,
		id: 'premier-partner',
		name: __( 'Premier Partner' ),
		description: sprintf(
			/* translators: %s is the influenced revenue */
			__( '%s+ influenced revenue and invitation to the tier.' ),
			formatCurrency( TARGET_INFLUENCED_REVENUE[ 'premier-partner' ], 'USD', { stripZeros: true } )
		),
		heading: __( '2 premium benefits' ),
		subheading: sprintf(
			/* translators: %d is the number of Prospect Reports an agency can create each month */
			__( 'Parse.ly trial, marketing funds, and %d Prospect Reports per month' ),
			getReportAllowance( 'premier-partner' )
		),
		progressCardDescription: __(
			"You've reached the highest tier! Enjoy all Premier Partner benefits including annual credits, Parse.ly trial, and marketing development funds."
		),
		influencedRevenue: TARGET_INFLUENCED_REVENUE[ 'premier-partner' ],
		benefits: [
			{
				icon: trendingUp,
				title: __( 'Free three-month Parse.ly trial' ),
				description: __(
					"Premier partners receive complimentary access to Parse.ly's content analytics platform for three months to optimize content strategy."
				),
			},
			{
				icon: currencyDollar,
				title: __( 'Marketing development funds' ),
				description: __(
					'Premier partners can access marketing development funds upon successful application to support Co-Marketing initiatives and agency growth.'
				),
			},
		],
	},
];
