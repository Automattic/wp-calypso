import { preventWidows } from 'calypso/lib/formatting';
import type { AgencyTier } from '../types';

interface Benefit {
	title: string;
	description: string;
	features: string[];
	isComingSoon: boolean;
	availableTiers: AgencyTier[];
}

const getTierBenefits = ( translate: ( key: string ) => string ): Benefit[] => [
	{
		title: translate( 'Tools & platforms' ),
		description: translate(
			'Intuitive agency dashboard for streamlined client billing, and client and product management.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [
			'emerging-partner',
			'agency-partner',
			'pro-agency-partner',
			'premier-partner',
		],
	},
	{
		title: translate( 'Earning opportunities' ),
		description: translate(
			"All partners get access to referral and reseller earning opportunities across all of Automattic's suite of products. Premier partners receive the highest earning opportunities."
		),
		features: [],
		isComingSoon: false,
		availableTiers: [
			'emerging-partner',
			'agency-partner',
			'pro-agency-partner',
			'premier-partner',
		],
	},
	{
		title: translate( 'Support' ),
		description: preventWidows(
			translate(
				'All program partners receive unified program and product support. Pro partners receive access to priority support across Automattic products. Premier partners receive the highest level of support and escalation.'
			)
		),
		features: [],
		isComingSoon: false,
		availableTiers: [
			'emerging-partner',
			'agency-partner',
			'pro-agency-partner',
			'premier-partner',
		],
	},
	{
		title: translate( 'Training & resources' ),
		description: translate(
			'Foundational product training, education and best practices on growing your agency, marketing materials, and advanced sales training*.'
		),
		features: [
			translate(
				'Pro partners eligible to receive advanced sales training and strategic consulting upon request.'
			),
		],
		isComingSoon: true,
		availableTiers: [
			'emerging-partner',
			'agency-partner',
			'pro-agency-partner',
			'premier-partner',
		],
	},
	{
		title: translate( 'Networking & community' ),
		description: translate(
			"Access Automattic's community platforms and network with like-minded agencies."
		),
		features: [],
		isComingSoon: true,
		availableTiers: [
			'emerging-partner',
			'agency-partner',
			'pro-agency-partner',
			'premier-partner',
		],
	},
	{
		title: translate( 'Directory visibility & badging' ),
		description: preventWidows(
			translate(
				"Eligible for inclusion in Automattic's agency directories and increased exposure to potential clients."
			)
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'agency-partner', 'pro-agency-partner', 'premier-partner' ],
	},
	{
		title: translate( 'Early access' ),
		description: translate(
			'Early access to new Automattic products and features (as available), and opportunities to contribute to the product roadmap.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'agency-partner', 'pro-agency-partner', 'premier-partner' ],
	},
	{
		title: translate( 'Co-marketing' ),
		description: translate(
			'Pro Agency Partners are eligible to participate in co-marketing activities with Automattic and our suite of brands, including case studies, co-branded campaigns, and other marketing opportunities as they arise. Premier partners can access marketing development funds upon successful application.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'pro-agency-partner', 'premier-partner' ],
	},
	{
		title: translate( 'Pre-qualified sales leads' ),
		description: translate(
			'Pro Partners eligible to receive pre-qualified leads from Automattic sales teams when opportunities arise as well as leads generated through agency directory listings.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'pro-agency-partner', 'premier-partner' ],
	},
	{
		title: translate( 'Dedicated agency partner manager' ),
		description: translate(
			'Pro partners receive access to an assigned agency partner manager for strategic guidance.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'pro-agency-partner', 'premier-partner' ],
	},
	{
		title: translate( 'Automattic advisory board' ),
		description: translate(
			"Pro partners are eligible to receive an invitation to the Automattic for Agencies advisory board to influence the program and Automattic's products."
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'pro-agency-partner', 'premier-partner' ],
	},
	{
		title: translate( 'Free products' ),
		description: translate(
			'Free agency site on WordPress.com or Pressable. Premier partners receive a complimentary three-month Parse.ly trial, and free WooCommerce and Jetpack extensions.'
		),
		features: [],
		isComingSoon: true,
		availableTiers: [ 'premier-partner' ],
	},
];

export default getTierBenefits;
