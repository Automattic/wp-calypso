import { __ } from '@wordpress/i18n';
import JetpackLogo from 'calypso/assets/images/a8c-for-agencies/events/jetpack-logo.svg';
import type { CSSProperties, ReactNode } from 'react';

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

/** What the card passes an action CTA, so its button matches the link CTAs beside it. */
export interface FeaturedEventCtaButtonProps {
	size: 'compact';
	variant: 'primary' | 'secondary';
	style?: CSSProperties;
	/** Records the CTA click. */
	onClick: () => void;
}

/** A CTA that acts in place, such as opening a dialog, instead of linking somewhere. */
export interface FeaturedEventActionCta {
	/** Used as the `cta_id` tracks property, so keep it stable per CTA. */
	id: string;
	render: ( buttonProps: FeaturedEventCtaButtonProps ) => ReactNode;
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
	when?: string;
	title: string;
	subtitle?: string;
	/** One entry per paragraph. Supports `<strong>` tags. */
	description: string[];
	ctas: ( FeaturedEventCta | FeaturedEventActionCta )[];
	/** ISO expiry for dated events; omitted for announcements without an expiry. */
	endsAt?: string;
}

export const getLeadMatchingContactAnnouncement = ( leadMatchingHref: string ): FeaturedEvent => ( {
	id: 'a4a-lead-matching-contact-options',
	title: __( 'Add your phone number and booking link for newly matched leads' ),
	description: [
		__(
			'You can now add your agency’s phone number and booking link so new leads you’re matched with can contact you right away.'
		),
	],
	ctas: [
		{
			id: 'update-details',
			label: __( 'Update your details' ),
			url: leadMatchingHref,
			variant: 'secondary',
		},
	],
} );

// The Jetpack holiday sale runs from November 19 00:00 UTC through December 2 23:59 UTC.
export const isJetpackHolidaySaleActive = () => {
	const now = new Date();
	return now >= new Date( '2026-11-19T00:00:00Z' ) && now < new Date( '2026-12-03T00:00:00Z' );
};

// The sale discount applies on its own at checkout, so the banner shows no coupon code.
export const getJetpackHolidaySaleEvent = ( jetpackProductsHref: string ): FeaturedEvent => ( {
	id: 'a4a-jetpack-holiday-sale-2026',
	logo: JetpackLogo,
	logoAlt: __( 'Jetpack' ),
	when: __( 'Limited time offer' ),
	title: __( '25% off new yearly Jetpack licenses' ),
	subtitle: __( 'Offer valid November 19 – December 2, 2026' ),
	description: [
		__(
			'Get 25% off the first year of any new yearly Jetpack plan or product. The discount applies automatically, and you’ll see the discounted price at checkout.'
		),
		__( 'Renewals, monthly licenses, and add-ons are not included.' ),
	],
	ctas: [
		{
			id: 'view-jetpack-products',
			label: __( 'View Jetpack products' ),
			url: jetpackProductsHref,
		},
	],
} );
