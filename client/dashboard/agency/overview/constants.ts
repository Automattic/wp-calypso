import { __ } from '@wordpress/i18n';
import type { AgencyTierType } from '../tiers/types';

export const PARTNER_PROGRAM_GUIDE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-tiering-benefits';

interface TierOverviewContent {
	description: string;
	hasPartnerManager: boolean;
}

export const TIER_OVERVIEW_CONTENT: Record< AgencyTierType, TierOverviewContent > = {
	'emerging-partner': {
		description: __(
			'You’re in the program. Refer or buy one Automattic product a year to stay active.'
		),
		hasPartnerManager: false,
	},
	'agency-partner': {
		description: __(
			'Listed in agency directories, a partner badge, and early access to new features.'
		),
		hasPartnerManager: false,
	},
	'pro-agency-partner': {
		description: __(
			'Free agency hosting, a dedicated Partner Manager, priority support, and co-marketing.'
		),
		hasPartnerManager: true,
	},
	'vip-pro-agency-partner': {
		description: __(
			'Free agency hosting, a dedicated Partner Manager, priority support, and co-marketing.'
		),
		hasPartnerManager: true,
	},
	'premier-partner': {
		description: __(
			'Top tier — Marketing Development Funds, a Parse.ly trial, co-marketing and dedicated support.'
		),
		hasPartnerManager: true,
	},
};
