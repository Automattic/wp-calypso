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
		title: translate( 'Tools & Platforms' ),
		description: translate(
			'Intuitive agency dashboard for streamlined client billing, and client and product management.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Earning Opportunities' ),
		description: translate(
			"All partners get access to referral and reseller earning opportunities across all of Automattic's suite of products."
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Support' ),
		description: preventWidows(
			translate(
				'All program partners receive unified program and product support. Pro partners receive access to priority support across Automattic products.'
			)
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Training & Resources' ),
		description: translate(
			'Foundational product training, education and best practices on growing your agency, marketing materials, and advanced sales training*.'
		),
		features: [
			translate(
				'Pro partners eligible to receive advanced sales training and strategic consulting upon request.'
			),
		],
		isComingSoon: true,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Networking & Community' ),
		description: translate(
			"Access Automattic's community platforms and network with like-minded agencies."
		),
		features: [],
		isComingSoon: true,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Directory Visibility & Badging' ),
		description: preventWidows(
			translate(
				"Eligible for inclusion in Automattic's agency directories and increased exposure to potential clients."
			)
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Early Access' ),
		description: translate(
			'Early access to new Automattic products and features (as available), and opportunities to contribute to the product roadmap.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Co-Marketing' ),
		description: translate(
			'Pro Agency Partners are eligible to participate in co-marketing activities with Automattic and our suite of brands, including case studies, co-branded campaigns, and other marketing opportunities as they arise.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'pro-agency-partner' ],
	},
	{
		title: translate( 'Pre-Qualified Sales Leads' ),
		description: translate(
			'Pro Partners eligible to receive pre-qualified leads from Automattic sales teams when opportunities arise as well as leads generated through agency directory listings.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'pro-agency-partner' ],
	},
	{
		title: translate( 'Dedicated Agency Partner Manager' ),
		description: translate(
			'Pro partners receive access to an assigned agency partner manager for strategic guidance.'
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'pro-agency-partner' ],
	},
	{
		title: translate( 'Automattic Advisory Board' ),
		description: translate(
			"Pro partners are eligible to receive an invitation to the Automattic for Agencies advisory board to influence the program and Automattic's products."
		),
		features: [],
		isComingSoon: false,
		availableTiers: [ 'pro-agency-partner' ],
	},
];

export default getTierBenefits;
