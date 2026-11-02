import { __ } from '@wordpress/i18n';
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
