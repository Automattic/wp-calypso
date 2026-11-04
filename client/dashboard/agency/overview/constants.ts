import { __ } from '@wordpress/i18n';
import type { AgencyTierType } from '../tiers/types';

export const PARTNER_PROGRAM_GUIDE_URL =
	'https://agencieshelp.automattic.com/knowledge-base/agency-tiering-benefits';

export const PROGRAM_INCENTIVES_URL = 'https://automattic.com/for-agencies/program-incentives/';

// Inlined from client/a8c-for-agencies/components/a4a-pressable-offer/constants
// so the dashboard has no dependency on the classic A4A app.

// The moment the holiday offer ends, 11:59pm Pacific on November 30, 2026: the
// introductory offer card and banner both stop at this instant.
export const PRESSABLE_HOLIDAY_2026_OFFER_ENDS_AT = '2026-12-01T08:00:00Z';
export const PRESSABLE_HOLIDAY_2026_OFFER_TERMS_URL =
	'https://pressable.com/legal/2026-holiday-promotion-terms-and-conditions/';
// The Q3 2026 offer has ended. Its dates stay because the expansion offer, which is
// not part of the holiday offer, keys its eligibility on the Q3 start date.
export const PRESSABLE_Q3_2026_OFFER_START_DATE = '2026-08-11';
// The day after the Q3 offer ended: the expansion offer card and the license fetch
// behind it both stop at this date.
export const PRESSABLE_Q3_2026_OFFER_ENDS_AT = '2026-10-01';
export const PRESSABLE_EXPANSION_OFFER_TERMS_URL =
	'https://pressable.com/legal/summer-2026-expansion-incentive-terms-and-conditions/';

export const AI_MCP_ANNOUNCEMENT_BLOG_POST_URL =
	'https://automattic.com/for-agencies/blog/our-new-mcp-brings-automattic-for-agencies-into-your-ai-workflow/';

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
			'Qualified leads, a dedicated Partner Manager, priority support, and co-marketing.'
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
