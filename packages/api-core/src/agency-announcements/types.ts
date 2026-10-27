export type AgencyAnnouncementType = 'event' | 'announcement';

export type AgencyAnnouncementLogo =
	'automattic' | 'jetpack' | 'woo' | 'pressable' | 'wordpress_com' | 'wordpress' | 'vip';

export interface AgencyAnnouncementCta {
	label: string;
	/** An absolute https URL, or a dashboard path. */
	url: string;
	/** Set for absolute URLs, which open in a new tab. */
	isExternal?: boolean;
}

/**
 * The date an item carries, by what it means: when an event starts, the last day
 * of an offer, or the day an announcement started showing.
 */
export interface AgencyAnnouncementDate {
	kind: 'event' | 'ends' | 'started';
	/** ISO 8601 UTC date-time for events, `YYYY-MM-DD` otherwise. */
	date: string;
}

/**
 * One item in the Overview's News and updates, from the wpcom API. The server only
 * returns published items inside their visibility window, already in display order.
 */
export interface AgencyAnnouncement {
	id: string;
	type: AgencyAnnouncementType;
	logo: AgencyAnnouncementLogo;
	eyebrow: string;
	headline: string;
	subtitle: string;
	description: string;
	primaryCta: AgencyAnnouncementCta;
	secondaryCta?: AgencyAnnouncementCta;
	when?: AgencyAnnouncementDate;
}
