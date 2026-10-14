import { formatCurrency } from '@automattic/number-formatters';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { PARTNER_DIRECTORY_ROUTE } from '../partner-directory/paths';
import type { ReactNode } from 'react';

export type OnboardingTourSectionId =
	| 'overview'
	| 'sites'
	| 'marketplace'
	| 'purchases'
	| 'referrals'
	| 'migrations'
	| 'woopayments'
	| 'partner-directory'
	| 'agency-tiers'
	| 'team'
	| 'growth-call';

export interface OnboardingTourSection {
	id: OnboardingTourSectionId;
	/** Label in the section list. */
	title: string;
	heading: string;
	descriptions: ReactNode[];
	hint?: ReactNode;
	/** Secondary action that leaves the tour for the screen the section describes. */
	explore?: { label: string; to: string };
	nextLabel?: string;
}

const WOOPAYMENTS_RATES_URL =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';

export function getOnboardingTourSections(): OnboardingTourSection[] {
	const bold = { b: <b /> };

	return [
		{
			id: 'overview',
			title: __( 'Welcome' ),
			heading: __( 'Welcome to Automattic for Agencies!' ),
			descriptions: [
				__(
					'We’re more than a site management platform—we’re your partner in growing your WordPress agency. This quick tour highlights key features and benefits to help you boost revenue and streamline your workflows.'
				),
			],
			hint: createInterpolateElement(
				__(
					'<b>Spoiler alert:</b> You can unlock serious earning potential, deliver better client results, and boost your agency’s efficiency. Stick with the tour to see how, or jump in and explore—your progress is saved and you can pick it back up any time.'
				),
				bold
			),
			explore: { label: __( 'Check out the overview page' ), to: '/overview' },
			nextLabel: __( 'Start tour' ),
		},
		{
			id: 'sites',
			title: __( 'Sites' ),
			heading: __( 'One dashboard. Every site. Seamless management.' ),
			descriptions: [
				__(
					'Monitor, manage, and optimize all your client sites—regardless of where they’re hosted—right from the Automattic for Agencies dashboard.'
				),
				__(
					'The lightweight plugin connects your sites in seconds. From there, use built-in Jetpack tools to track performance, boost speed, and keep things secure and backed up.'
				),
			],
			hint: createInterpolateElement(
				sprintf(
					/* translators: %s is the yearly value of Jetpack Complete per site, e.g. "$800+". */
					__(
						'<b>Pro tip:</b> Sites hosted on Pressable come with Jetpack Complete (a %s value per site, annually) at no extra cost.'
					),
					`${ formatCurrency( 800, 'USD', { stripZeros: true } ) }+`
				),
				bold
			),
			explore: { label: __( 'Connect your first site' ), to: '/sites' },
		},
		{
			id: 'marketplace',
			title: __( 'Marketplace' ),
			heading: __( 'Buy at a discount or earn commission—your choice!' ),
			descriptions: [
				sprintf(
					/* translators: 1: the largest volume discount, e.g. 77; 2: the largest referral commission, e.g. 50. Both are percentages. */
					__(
						'Our marketplace is a one-stop shop for all of your client hosting and product needs. Enjoy up to %1$d%% off with volume discounts, or switch to referral mode and let clients pay while you earn up to %2$d%% commission without the billing headaches.'
					),
					77,
					50
				),
				__( 'Did we mention this is a recurring commission?' ),
			],
			explore: { label: __( 'Explore products & hosting' ), to: '/marketplace' },
		},
		{
			id: 'purchases',
			title: __( 'Purchases' ),
			heading: __( 'Easily manage all your purchases in one spot.' ),
			descriptions: [
				__(
					'Assign Jetpack products and Woo extensions, launch WordPress.com sites, manage Pressable hosting, and access all your billing and invoices—no digging required.'
				),
			],
			explore: { label: __( 'View purchases' ), to: '/marketplace/purchases' },
		},
		{
			id: 'referrals',
			title: __( 'Referrals' ),
			heading: __( 'Track referrals and commissions with ease' ),
			descriptions: [
				__(
					'Send referrals through the marketplace, then head to your Referrals Dashboard to view total commissions, upcoming payouts, and the status of your clients’ products and hosting.'
				),
				__(
					'You’ll earn a 20% recurring commission for referring Pressable or WordPress.com hosting, and a 50% recurring commission for referring Woo or Jetpack products.'
				),
			],
			explore: { label: __( 'View Referrals Dashboard' ), to: '/referrals' },
		},
		{
			id: 'migrations',
			title: __( 'Migrations' ),
			heading: __( 'Better hosting for your clients.' ),
			descriptions: [
				__(
					'Tired of subpar hosting? Migrate your sites to WordPress.com or Pressable and tap into WP Cloud—the only cloud platform built just for WordPress.'
				),
				__(
					'We offer 5 free development licenses on WordPress.com (only pay when you launch) and a free Pressable demo. See the difference for yourself.'
				),
			],
			explore: { label: __( 'View migration offer' ), to: '/migrations' },
		},
		{
			id: 'woopayments',
			title: __( 'WooPayments' ),
			heading: __( 'Learn. Pitch. Earn.' ),
			descriptions: [
				__(
					'If you build sites using WooCommerce, you’re leaving money on the table by not using WooPayments, Woo’s fully-integrated payments solution.'
				),
				createInterpolateElement(
					__(
						'Earn recurring revenue share on client store sales when they use WooPayments. <a>Rates vary based on whether the store is new or pre-existing — see details</a>.'
					),
					{ a: <ExternalLink href={ WOOPAYMENTS_RATES_URL } children={ null } /> }
				),
				__(
					'We’ve made it easy for you to learn about WooPayments, copy and paste a pitch to send to your clients, and track your earnings from your referrals all in one place.'
				),
			],
			explore: { label: __( 'Check out WooPayments' ), to: '/woopayments' },
		},
		{
			id: 'partner-directory',
			title: __( 'Partner Directories' ),
			heading: __( 'Get leads from multiple agency directories' ),
			descriptions: [
				createInterpolateElement(
					__(
						'By partnering with us, you’re eligible to be listed on up to four agency directories across our <woo>Woo</woo>, <pressable>Pressable</pressable>, <wpcom>WordPress.com</wpcom>, and <jetpack>Jetpack</jetpack> sites.'
					),
					{
						woo: (
							<ExternalLink
								href="https://woocommerce.com/development-services/"
								children={ null }
							/>
						),
						pressable: (
							<ExternalLink href="https://pressable.com/development-services/" children={ null } />
						),
						wpcom: (
							<ExternalLink href="https://wordpress.com/development-services/" children={ null } />
						),
						jetpack: (
							<ExternalLink href="https://jetpack.com/development-services/" children={ null } />
						),
					}
				),
				__(
					'To get listed on these directories, you have to qualify for our Agency Partner tier and demonstrate expertise with each of the brands that you would like to be listed with.'
				),
			],
			explore: { label: __( 'Check out Partner Directories' ), to: PARTNER_DIRECTORY_ROUTE },
		},
		{
			id: 'agency-tiers',
			title: __( 'Agency Tiers' ),
			heading: __( 'Resources and rewards tailored for your growth' ),
			descriptions: [
				__(
					'Our Agency Tiers program unlocks exclusive perks—like Co-Marketing, directory placement, pre-qualified leads, and dedicated partner managers. More tools, more visibility, more ways to earn.'
				),
			],
			explore: { label: __( 'Check out Agency Tiers' ), to: '/tiers' },
		},
		{
			id: 'team',
			title: __( 'Team' ),
			heading: __( 'Invite your team. Reclaim your time.' ),
			descriptions: [
				__(
					'Running a growing agency is a team sport. With our dashboard, you can bring your whole crew along to help manage sites, send referrals, and keep clients happy.'
				),
			],
			explore: { label: __( 'Add your team' ), to: '/agency/team' },
		},
		{
			id: 'growth-call',
			title: __( 'Free growth call' ),
			heading: __( 'Free agency growth call' ),
			descriptions: [
				__(
					'Set up time with one of our growth specialists to think more strategically about your agency’s success. Together, we’ll explore your goals, identify new opportunities, and share proven ways to attract and retain more clients. Reach out anytime — we’re here to support you.'
				),
			],
		},
	];
}
