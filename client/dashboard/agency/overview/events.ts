import { __ } from '@wordpress/i18n';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import {
	MARKETPLACE_HOSTING_PRESSABLE_PATH,
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
	when: string;
	title: string;
	subtitle: string;
	/** One entry per paragraph. */
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
	id: 'a4a-wordcamp-us-2026',
	logo: 'https://automattic.wordpress.com/wp-content/uploads/2026/07/wcus_2026.png',
	logoAlt: __( 'WordCamp US 2026' ),
	when: __( 'August 16th–19th, Phoenix, Arizona' ),
	title: __( 'Join us at WordCamp US 2026!' ),
	subtitle: __( 'Automattic for Agencies' ),
	description: [
		__(
			'Join us at WordCamp US in Phoenix, August 16 to 19 at the Phoenix Convention Center. The Automattic for Agencies team will be there, along with the people behind WordPress.com, Pressable, WordPress VIP, Woo, and Jetpack.'
		),
		__(
			'Come talk shop with our partner managers, get answers in person, and grab a pin while they last.'
		),
	],
	ctas: [
		{
			id: 'register',
			label: __( 'Get your spot!' ),
			url: 'https://us.wordcamp.org/2026/',
			isExternal: true,
		},
	],
	endsAt: '2026-08-20',
};

/**
 * The Q3 2026 Pressable promos, shown to eligible agencies alongside the
 * featured event. Which one an agency sees is decided by the shells through
 * the eligibility props on AgencyOverviewContent: the introductory offer
 * targets agencies without a Pressable plan through A4A, the expansion offer
 * agencies with one that missed the introductory offer.
 */
export const PRESSABLE_INTRO_OFFER_EVENT: FeaturedEvent = {
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
			url: MARKETPLACE_HOSTING_PRESSABLE_PATH,
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
};

export const PRESSABLE_EXPANSION_OFFER_EVENT: FeaturedEvent = {
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
			url: MARKETPLACE_HOSTING_PRESSABLE_PATH,
			legacyTrackEventName:
				'calypso_a4a_overview_events_a4a_pressable_expansion_offer_see_pressable_plans_click',
		},
	],
	endsAt: PRESSABLE_Q3_2026_OFFER_ENDS_AT,
};
