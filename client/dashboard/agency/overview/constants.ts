import { __ } from '@wordpress/i18n';
import type { AgencyTierType } from '../tiers/types';

export const PARTNER_PROGRAM_GUIDE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-tiering-benefits';

export const PROGRAM_INCENTIVES_URL = 'https://automattic.com/for-agencies/program-incentives/';

// Inlined from client/a8c-for-agencies/components/a4a-pressable-offer/constants
// so the dashboard has no dependency on the classic A4A app.
export const PRESSABLE_Q3_2026_OFFER_START_DATE = '2026-08-11';
/** The day after the offer ends: the promo cards and the license fetch behind
 * the expansion offer both stop at this date. */
export const PRESSABLE_Q3_2026_OFFER_ENDS_AT = '2026-10-01';
export const PRESSABLE_INTRODUCTORY_OFFER_TERMS_URL =
	'https://pressable.com/legal/late-summer-promotion-terms-and-conditions/';
export const PRESSABLE_EXPANSION_OFFER_TERMS_URL =
	'https://pressable.com/legal/summer-2026-expansion-incentive-terms-and-conditions/';

// Resolves in the classic A4A marketplace until a dashboard Pressable hosting
// page exists, like the links in agency/marketplace/exclusive-offers.
export const MARKETPLACE_HOSTING_PRESSABLE_PATH = '/marketplace/hosting/pressable';

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
			'Everything in Pro, plus higher WordPress VIP referral commissions and annual extension credits.'
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
