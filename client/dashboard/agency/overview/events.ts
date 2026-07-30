import { __ } from '@wordpress/i18n';

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
	ctaLabel: string;
	url: string;
}

/**
 * The event promoted on the agency overview, curated by hand.
 *
 * Replace the whole object when the next event comes round, and set it to `null`
 * in between — the card hides itself rather than advertising a past event. The
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
	ctaLabel: __( 'Get your spot!' ),
	url: 'https://us.wordcamp.org/2026/',
};
