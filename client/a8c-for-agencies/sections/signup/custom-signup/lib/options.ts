/**
 * PROTOTYPE — proof of concept only.
 *
 * Answer options for `/custom-signup`. Values are stable keys so the overview
 * page can map answers to personalized content.
 */
import { translate } from 'i18n-calypso';

export type ChoiceOption = {
	value: string;
	label: string;
	description?: string;
	// Expands into a free-text field when selected.
	isOther?: boolean;
};

export const getUserTypeOptions = (): ChoiceOption[] => [
	{ value: 'agency_owner', label: translate( 'Agency owner' ) },
	{ value: 'developer_at_agency', label: translate( 'Developer at an agency' ) },
	{
		value: 'sales_marketing_operations_at_agency',
		label: translate( 'Sales, marketing, or operations at an agency' ),
	},
	{ value: 'freelancer', label: translate( 'Freelancer' ) },
];

export const AGENCY_SIZE_OPTIONS = [ '1-5', '6-10', '11-25', '26-50', '51-100', '101-250', '251+' ];

export const MANAGED_SITES_OPTIONS = [ '1-5', '6-20', '21-50', '51-100', '101-500', '500+' ];

export const getServicesOfferedOptions = (): ChoiceOption[] => [
	{ value: 'strategy_consulting', label: translate( 'Strategy consulting' ) },
	{ value: 'website_design_development', label: translate( 'Design & development' ) },
	{ value: 'performance_optimization', label: translate( 'Performance optimization' ) },
	{ value: 'digital_strategy_marketing', label: translate( 'Digital marketing' ) },
	{ value: 'ecommerce_development', label: translate( 'Ecommerce' ) },
	{ value: 'maintenance_support_plans', label: translate( 'Maintenance & support' ) },
	{ value: 'other', label: translate( 'Other' ) },
];

// Step 3: what the agency needs help with.
export const getChallengeOptions = (): ChoiceOption[] => [
	{
		value: 'more_leads',
		label: translate( 'I need more leads for my business' ),
		description: translate( 'Get listed in Automattic directories and receive qualified leads.' ),
	},
	{
		value: 'passive_income',
		label: translate( 'I want to earn passive income' ),
		description: translate( 'Earn recurring commissions on referrals and WooPayments.' ),
	},
	{
		value: 'better_hosting',
		label: translate( 'I need better hosting' ),
		description: translate( 'Exclusive pricing, reliable uptime, and free migrations.' ),
	},
	{
		value: 'optimize_operations',
		label: translate( 'I want to optimize my operations and tooling' ),
		description: translate(
			'Discover how to use Automattic tools to drive more impact for clients.'
		),
	},
	{ value: 'other', label: translate( 'Other' ), isOther: true },
];
