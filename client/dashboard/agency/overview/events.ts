import { __, sprintf } from '@wordpress/i18n';
import A4ALogo from 'calypso/assets/images/a8c-for-agencies/events/a4a-logo.svg';
import EvolveDigitalLogo from 'calypso/assets/images/a8c-for-agencies/events/evolvedigital-logo.svg';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import WordPressLogo from 'calypso/assets/images/a8c-for-agencies/events/wporg-logo-green.svg';
import {
	BASE_DISCOUNT,
	CERTIFICATION_EXAM_URL,
	PROMO_LAST_DAY,
	PROMO_MULTIPLIER,
} from '../certification/constants';
import {
	AI_MCP_ANNOUNCEMENT_BLOG_POST_URL,
	PRESSABLE_EXPANSION_OFFER_TERMS_URL,
	PRESSABLE_INTRODUCTORY_OFFER_TERMS_URL,
	PRESSABLE_Q3_2026_OFFER_ENDS_AT,
} from './constants';

export interface FeaturedEventCta {
	/** Used as the `cta_id` tracks property, so keep it stable per CTA. */
	id: string;
	label: string;
	url: string;
	variant?: 'primary' | 'secondary';
	/** Opens the link in a new tab, with the new-tab arrow on the label. */
	isExternal?: boolean;
	/**
	 * Also fired on click: the per-CTA event name the classic News and updates
	 * section fires, so funnels keyed on it keep working across the transition.
	 */
	legacyTrackEventName?: string;
}

export interface FeaturedEvent {
	/** Used as the `event_id` tracks property, so keep it stable per event. */
	id: string;
	/**
	 * Square event logo, rendered at 64px. Prefer a hosted URL over a committed
	 * asset. Optional, so the card still renders without one.
	 */
	logo?: string;
	logoAlt?: string;
	/** Uppercase eyebrow above the title: a date for events, a label for announcements. */
	when: string;
	title: string;
	subtitle: string;
	/** One entry per paragraph. Supports `<strong>` and `<code>` tags. */
	description: string[];
	ctas: FeaturedEventCta[];
	/** ISO date the card stops showing itself, typically the day after the event. */
	endsAt: string;
}

/**
 * The event promoted on the agency overview, curated by hand.
 *
 * Replace the whole object when the next event comes round — the card hides
 * itself once `endsAt` passes rather than advertising a past event. The
 * legacy list lives in client/a8c-for-agencies/sections/overview/body/events.
 */
export const FEATURED_EVENT: FeaturedEvent | null = {
	id: 'a4a-evolvedigital-nyc-2026',
	logo: EvolveDigitalLogo,
	logoAlt: __( 'EvolveDigital' ),
	when: __( 'November 19–20 · Civic Hall, NYC' ),
	title: __( 'Join us at EvolveDigital NYC 2026' ),
	subtitle: __( 'Automattic for Agencies & EvolveDigital' ),
	description: [
		__(
			'Automattic is a Presenting Sponsor of EvolveDigital NYC 2026, bringing the teams behind WordPress.com, WordPress VIP, and WooCommerce to a room of developers, designers, strategists, and digital leaders from higher ed, government, nonprofits, and agencies.'
		),
		/* translators: Automattic50Off is a ticket discount code. Keep it exactly as written. */
		__(
			'Spend two days at Civic Hall with the people shaping the future of the open web. As an Automattic for Agencies partner, you get 50% off General Admission tickets with the code <strong><code>Automattic50Off</code></strong>, so come say hello to our team while you’re there.'
		),
	],
	ctas: [
		{
			id: 'purchase-tickets',
			label: __( 'Purchase tickets' ),
			url: 'https://www.evolvedigital.com/',
			variant: 'primary',
			isExternal: true,
			legacyTrackEventName:
				'calypso_a4a_overview_events_evolvedigital_nyc_2026_purchase_tickets_click',
		},
	],
	// Hidden at midnight ET when the event starts (November 19), not at
	// midnight UTC, which would drop it the evening before for US agencies.
	endsAt: '2026-11-19T05:00:00Z',
};

/**
 * The Q3 2026 Pressable promos, shown to eligible agencies alongside the
 * featured event. Which one an agency sees is decided by the shells through
 * the eligibility props on AgencyOverviewContent: the introductory offer
 * targets agencies without a Pressable plan through A4A, the expansion offer
 * agencies with one that missed the introductory offer.
 */
export const getPressableIntroOfferEvent = ( pressableHostingHref: string ): FeaturedEvent => ( {
	id: 'a4a-pressable-promo-offer-2026-q3',
	logo: PressableLogo,
	logoAlt: __( 'Pressable' ),
	when: __( 'Limited time offer · Until September 30, 2026' ),
	title: __( 'Get up to 6 months of free Pressable hosting on new plans!' ),
	subtitle: __( 'Automattic for Agencies & Pressable' ),
	description: [
		__(
			'Enjoy up to 6 months free on Pressable Signature and Premium Plans with Automattic for Agencies. Choose annual billing for 6 months free or monthly billing for 3 months free, while still earning revenue share and reseller incentives.'
		),
	],
	ctas: [
		{
			id: 'view-promo-details',
			label: __( 'View promo details' ),
			url: pressableHostingHref,
			variant: 'primary',
			legacyTrackEventName:
				'calypso_a4a_overview_events_a4a_pressable_promo_offer_q3_2026_view_promo_details_click',
		},
		{
			id: 'see-full-terms',
			label: __( 'See full terms' ),
			url: PRESSABLE_INTRODUCTORY_OFFER_TERMS_URL,
			isExternal: true,
			legacyTrackEventName:
				'calypso_a4a_overview_events_a4a_pressable_promo_offer_q3_2026_see_full_terms_click',
		},
	],
	endsAt: PRESSABLE_Q3_2026_OFFER_ENDS_AT,
} );

export const getPressableExpansionOfferEvent = (
	pressableHostingHref: string
): FeaturedEvent => ( {
	id: 'a4a-pressable-expansion-offer-2026-q3',
	logo: PressableLogo,
	logoAlt: __( 'Pressable' ),
	when: __( 'Limited time offer · Until September 30, 2026' ),
	title: __( 'Upgrade your Pressable plan and get up to 6 months of the upgrade free' ),
	subtitle: __( 'Automattic for Agencies & Pressable' ),
	description: [
		__(
			'Move up a Pressable plan tier and we’ll cover part of the increase: 6 months’ worth on annual upgrades, 3 months’ worth on monthly.'
		),
		__(
			'For example, an annual upgrade from $10,000 to $13,250/yr is a $3,250 increase, so you’d save $1,625. The discount is calculated on that increase. Migrating 50+ sites? You may qualify for a custom incentive, up to $25,000.'
		),
	],
	ctas: [
		{
			id: 'view-promo-details',
			label: __( 'View promo details' ),
			url: PRESSABLE_EXPANSION_OFFER_TERMS_URL,
			variant: 'primary',
			isExternal: true,
			legacyTrackEventName:
				'calypso_a4a_overview_events_a4a_pressable_expansion_offer_view_promo_details_click',
		},
		{
			id: 'see-pressable-plans',
			label: __( 'See Pressable plans' ),
			url: pressableHostingHref,
			legacyTrackEventName:
				'calypso_a4a_overview_events_a4a_pressable_expansion_offer_see_pressable_plans_click',
		},
	],
	endsAt: PRESSABLE_Q3_2026_OFFER_ENDS_AT,
} );

/**
 * The MCP launch announcement, shown to every agency below the Pressable promos.
 *
 * Takes the AI & MCP href because the two shells mount that screen at different
 * paths (/resources-and-tools/ai-mcp in classic A4A, /agency/ai in the
 * dashboard), so it arrives through AgencyOverviewLinks rather than a constant.
 */
export const getAiMcpAnnouncement = ( aiMcpHref: string ): FeaturedEvent => ( {
	id: 'a4a-ai-mcp-announcement',
	logo: A4ALogo,
	logoAlt: __( 'Automattic for Agencies' ),
	when: __( 'New · AI and MCP' ),
	title: __( 'Bring Automattic for Agencies into your AI tools' ),
	subtitle: __( 'Automattic for Agencies MCP' ),
	description: [
		__(
			'Get answers about your agency without hunting through the dashboard. Ask about your tier, commissions, billing, or site health from Claude, ChatGPT, Cursor, or whatever AI tool your team already uses, and the answer comes back from your live account in seconds.'
		),
		__(
			'Schedule a weekly digest to Slack, or build a custom dashboard your whole team can use. Our MCP is free and connects in minutes.'
		),
	],
	ctas: [
		{
			id: 'enable-mcp',
			label: __( 'Enable MCP' ),
			url: aiMcpHref,
			variant: 'primary',
		},
		{
			id: 'see-how-it-works',
			label: __( 'See how it works' ),
			url: AI_MCP_ANNOUNCEMENT_BLOG_POST_URL,
			isExternal: true,
		},
	],
	endsAt: '2026-10-08',
} );

/**
 * The Q1 2027 doubled developer certification discount, shown only to agencies
 * with an active code, since "Get your code" leads to the tier page card.
 */
export const getCertificationPromoEvent = ( tiersHref: string ): FeaturedEvent => ( {
	id: 'a4a-certification-promo-2027-q1',
	logo: WordPressLogo,
	logoAlt: __( 'WordPress' ),
	when: __( 'Limited time offer · Until March 31, 2027' ),
	title: __( 'Certify your developers at double the discount' ),
	subtitle: __( 'Automattic for Agencies & WordPress Certifications' ),
	description: [
		sprintf(
			/* translators: %d is the highest percentage discount, e.g. 50 */
			__(
				'Until March 31, 2027, your agency’s code takes twice the usual discount off the Advanced Professional WordPress Developer exam, up to %d%% for Premier Partners.'
			),
			BASE_DISCOUNT[ 'premier-partner' ] * PROMO_MULTIPLIER
		),
	],
	ctas: [
		{
			id: 'get-your-code',
			label: __( 'Get your code' ),
			url: `${ tiersHref }#certification`,
			variant: 'primary',
		},
		{
			id: 'about-the-exam',
			label: __( 'About the exam' ),
			url: CERTIFICATION_EXAM_URL,
			isExternal: true,
		},
	],
	// The same moment the "Doubled until" badge goes, which is UTC-based.
	endsAt: `${ PROMO_LAST_DAY }T23:59:59.999Z`,
} );
