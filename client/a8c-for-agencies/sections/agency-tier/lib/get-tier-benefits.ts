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
		title: translate( 'Sales Training & Resources' ),
		description: translate(
			'Foundational product training, marketing materials, and advanced sales training.'
		),
		features: [
			translate( 'Pro partners eligible to receive advanced sales training upon request.' ),
		],
		isComingSoon: true,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Support' ),
		description: preventWidows(
			translate( 'Program support, priority product support*, and dedicated partner managers*.' )
		),
		features: [
			translate(
				'Pro partners receive access to assigned partner manager & priority support across Automattic products.'
			),
		],
		isComingSoon: true,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Earning & Growth Opportunities' ),
		description: translate(
			'Reseller and referral earning opportunities, access to leads generated through agency directory listing(s)*, and pre-qualified leads from Automattic sales teams*.'
		),
		features: [
			translate(
				'Agency Partners eligible to receive leads generated through agency directory listings.'
			),
			translate(
				'Pro Partners eligible to receive pre-qualified leads from Automattic sales teams when opportunities arise as well as leads generated through agency directory listings.'
			),
		],
		isComingSoon: true,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Networking & Community' ),
		description: translate(
			'Access to Automattic community platforms and advisory board* for strategic insights.'
		),
		features: [
			translate( 'Pro partners eligible to receive invitation to join Automattic Advisory Board.' ),
		],
		isComingSoon: true,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Tools & Platforms' ),
		description: translate(
			'Agency dash for streamlined client billing, program and product management, and free agency site on WordPress.com or Pressable*.'
		),
		features: [
			translate( 'Agency partners receive a free WordPress.com and a Pressable site.' ),
			translate( 'Pro partners receive a free WordPress.com and a Pressable site.' ),
		],
		isComingSoon: true,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Visibility & Marketing' ),
		description: preventWidows(
			translate( 'Inclusion in agency directories and co-marketing opportunities*.' )
		),
		features: [ translate( 'Pro partners eligible for co-marketing opportunities.' ) ],
		isComingSoon: true,
		availableTiers: [ 'agency-partner', 'pro-agency-partner' ],
	},
	{
		title: translate( 'Special Features' ),
		description: translate( 'Early access to new Automattic Products and features.' ),
		features: [],
		isComingSoon: true,
		availableTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
	},
];

export default getTierBenefits;
