import { __ } from '@wordpress/i18n';
import A4ALogo from 'calypso/assets/images/a8c-for-agencies/events/a4a-logo.svg';
import AvalaraLogo from 'calypso/assets/images/a8c-for-agencies/events/avalara-logo.svg';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import VipLogo from 'calypso/assets/images/a8c-for-agencies/events/vip-logo.svg';
import WooLogo from 'calypso/assets/images/a8c-for-agencies/events/woo-logo.svg';
import WordPressLogo from 'calypso/assets/images/a8c-for-agencies/events/wporg-logo-green.svg';
import {
	AI_MCP_ANNOUNCEMENT_BLOG_POST_URL,
	PRESSABLE_INTRODUCTORY_OFFER_TERMS_URL,
} from '../constants';

/** The preloaded logos an announcement can pick from, by key. */
export const ANNOUNCEMENT_LOGOS = {
	a4a: { src: A4ALogo, alt: __( 'Automattic for Agencies' ) },
	pressable: { src: PressableLogo, alt: __( 'Pressable' ) },
	vip: { src: VipLogo, alt: __( 'WordPress VIP' ) },
	woo: { src: WooLogo, alt: __( 'WooCommerce' ) },
	wordpress: { src: WordPressLogo, alt: __( 'WordPress' ) },
	avalara: { src: AvalaraLogo, alt: __( 'Avalara' ) },
} as const;

export type AnnouncementLogo = keyof typeof ANNOUNCEMENT_LOGOS;

export interface AnnouncementCta {
	label: string;
	url: string;
	/** Opens in a new tab, with the new-tab arrow on the label. */
	isExternal?: boolean;
}

export type AnnouncementType = 'event' | 'announcement' | 'blog';

/**
 * The date an item carries, by what it means: when an event happens, the last
 * day of an offer, the day a post was published, or the day an announcement
 * started showing (it has no date of its own and leaves when its timeframe ends).
 */
export interface AnnouncementDate {
	kind: 'event' | 'ends' | 'posted' | 'started';
	/** ISO date or date-time. */
	date: string;
}

/**
 * One item in News and updates. The seven fields marketing fills in for every
 * event, promo and announcement; targeting (region, tier, products owned) and
 * the timeframe are applied before the list reaches the dashboard, which shows
 * the items in the order they arrive.
 */
export interface Announcement {
	id: string;
	/** Filters and tabs read it, so the API needs to send it. */
	type: AnnouncementType;
	logo: AnnouncementLogo;
	/** Blog posts show their own image in place of a logo. */
	image?: string;
	eyebrow: string;
	headline: string;
	subtitle: string;
	description: string;
	primaryCta: AnnouncementCta;
	secondaryCta?: AnnouncementCta;
	when?: AnnouncementDate;
}

interface AnnouncementLinks {
	aiMcp: string;
	pressableHosting: string;
	referrals: string;
}

const BLOG = 'https://automattic.com/for-agencies/blog';
const UPLOADS = 'https://automattic.com/wp-content/uploads';

/**
 * Placeholder items for the design prototype, in the order a server would
 * return them: four events, five announcements (one an offer), three posts.
 */
export const getPlaceholderAnnouncements = ( links: AnnouncementLinks ): Announcement[] => [
	{
		id: 'ai-visibility-webinar',
		type: 'event',
		logo: 'a4a',
		eyebrow: __( 'Webinar · 11 AM ET' ),
		headline: __( 'Run an AI visibility audit for a client, live' ),
		subtitle: __( 'Automattic for Agencies & WordPress VIP' ),
		description: __(
			'Watch an Amplify audit run start to finish, then turn the findings into a scoped project your client can approve.'
		),
		primaryCta: {
			label: __( 'Save your spot' ),
			url: `${ BLOG }/from-audit-to-action-how-agencies-can-close-the-ai-visibility-gap/`,
			isExternal: true,
		},
		secondaryCta: {
			label: __( 'Add to calendar' ),
			url: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Run%20an%20AI%20visibility%20audit%20for%20a%20client%2C%20live&dates=20261022T150000Z/20261022T160000Z',
			isExternal: true,
		},
		when: { kind: 'event', date: '2026-10-22T15:00:00Z' },
	},
	{
		id: 'ai-mcp',
		type: 'announcement',
		logo: 'a4a',
		eyebrow: __( 'AI and MCP' ),
		headline: __( 'Bring Automattic for Agencies into your AI tools' ),
		subtitle: __( 'Automattic for Agencies MCP' ),
		description: __(
			'Ask about your tier, commissions, billing, or site health from Claude, ChatGPT, Cursor, or the AI tool your team already uses. Our MCP is free and connects in minutes.'
		),
		primaryCta: { label: __( 'Enable MCP' ), url: links.aiMcp },
		secondaryCta: {
			label: __( 'See how it works' ),
			url: AI_MCP_ANNOUNCEMENT_BLOG_POST_URL,
			isExternal: true,
		},
		when: { kind: 'started', date: '2026-10-14' },
	},
	{
		id: 'pressable-offer',
		type: 'announcement',
		logo: 'pressable',
		eyebrow: __( 'Limited time offer' ),
		headline: __( 'Get up to 6 months of free Pressable hosting on new plans' ),
		subtitle: __( 'Automattic for Agencies & Pressable' ),
		description: __(
			'Choose annual billing for 6 months free or monthly billing for 3 months free on Signature and Premium plans, and keep earning revenue share.'
		),
		primaryCta: { label: __( 'View promo details' ), url: links.pressableHosting },
		secondaryCta: {
			label: __( 'See full terms' ),
			url: PRESSABLE_INTRODUCTORY_OFFER_TERMS_URL,
			isExternal: true,
		},
		when: { kind: 'ends', date: '2026-11-30' },
	},
	{
		id: 'pressable-office-hours',
		type: 'event',
		logo: 'pressable',
		eyebrow: __( 'Office hours · 12 PM ET' ),
		headline: __( 'Pressable migration office hours' ),
		subtitle: __( 'Pressable' ),
		description: __(
			'Bring your site list. The Pressable team will help you plan client moves before peak season.'
		),
		primaryCta: {
			label: __( 'Book a slot' ),
			url: `${ BLOG }/moving-client-sites-to-pressable-seven-things-to-get-right/`,
			isExternal: true,
		},
		when: { kind: 'event', date: '2026-10-29T16:00:00Z' },
	},
	{
		id: 'blog-pressable-migration',
		type: 'blog',
		logo: 'a4a',
		image: `${ UPLOADS }/2026/10/a4a-pressable-migration-2.png`,
		eyebrow: __( 'From the blog' ),
		headline: __( 'Moving client sites to Pressable: seven things to get right' ),
		subtitle: __( 'Automattic for Agencies blog' ),
		description: __(
			'Avoid the small mistakes that cause most migration problems, from DNS to caching.'
		),
		primaryCta: {
			label: __( 'Read the post' ),
			url: `${ BLOG }/moving-client-sites-to-pressable-seven-things-to-get-right/`,
			isExternal: true,
		},
		when: { kind: 'posted', date: '2026-10-07' },
	},
	{
		id: 'referral-branding',
		type: 'announcement',
		logo: 'a4a',
		eyebrow: __( 'Referrals' ),
		headline: __( 'Your referrals now look as good as your agency' ),
		subtitle: __( 'Automattic for Agencies' ),
		description: __(
			'Add your logo to referral emails, preview what clients see, and share a direct checkout link.'
		),
		primaryCta: { label: __( 'Open referrals' ), url: links.referrals },
		secondaryCta: {
			label: __( 'Read the post' ),
			url: `${ BLOG }/referral-invoice-branding/`,
			isExternal: true,
		},
		when: { kind: 'started', date: '2026-10-01' },
	},
	{
		id: 'woo-retainers-workshop',
		type: 'event',
		logo: 'woo',
		eyebrow: __( 'Workshop · 11 AM ET' ),
		headline: __( 'Turn retainers into recurring commissions' ),
		subtitle: __( 'Automattic for Agencies & WooCommerce' ),
		description: __(
			'How partners use referrals and WooPayments to earn every month on products their clients already pay for.'
		),
		primaryCta: {
			label: __( 'RSVP' ),
			url: `${ BLOG }/referral-invoice-branding/`,
			isExternal: true,
		},
		when: { kind: 'event', date: '2026-11-05T16:00:00Z' },
	},
	{
		id: 'blog-black-friday',
		type: 'blog',
		logo: 'a4a',
		image: `${ UPLOADS }/2026/09/a4a-webinar-banner-uud8klyf.png`,
		eyebrow: __( 'From the blog' ),
		headline: __( 'Your Black Friday playbook' ),
		subtitle: __( 'Automattic for Agencies blog' ),
		description: __( 'When to start, what to test, and how to sort client stores by risk.' ),
		primaryCta: {
			label: __( 'Read the post' ),
			url: `${ BLOG }/your-black-friday-playbook-how-to-prepare-for-peak-season/`,
			isExternal: true,
		},
		when: { kind: 'posted', date: '2026-09-30' },
	},
	{
		id: 'vip-enterprise-ai',
		type: 'announcement',
		logo: 'vip',
		eyebrow: __( 'From WordPress VIP' ),
		headline: __( 'Where enterprise AI breaks down, and how to scope the fix' ),
		subtitle: __( 'WordPress VIP & Americaneagle.com' ),
		description: __(
			'A framework for the AI projects enterprise clients ask for, and the scoped work it points to.'
		),
		primaryCta: {
			label: __( 'Read the framework' ),
			url: `${ BLOG }/where-enterprise-ai-breaks-down-and-how-agencies-can-scope-the-fix/`,
			isExternal: true,
		},
		when: { kind: 'started', date: '2026-10-12' },
	},
	{
		id: 'blog-ai-brand',
		type: 'blog',
		logo: 'a4a',
		image: `${ UPLOADS }/2026/09/screenshot-2026-09-11-at-3.42.08-pm.png`,
		eyebrow: __( 'From the blog' ),
		headline: __( 'When AI gets your client’s brand wrong' ),
		subtitle: __( 'Automattic for Agencies blog' ),
		description: __(
			'Five places to look for the gap between what a client says and what AI tells buyers.'
		),
		primaryCta: {
			label: __( 'Read the post' ),
			url: `${ BLOG }/when-ai-gets-your-clients-brand-wrong-five-places-agencies-should-look/`,
			isExternal: true,
		},
		when: { kind: 'posted', date: '2026-09-14' },
	},
	{
		id: 'telex-blocks',
		type: 'announcement',
		logo: 'wordpress',
		eyebrow: __( 'Telex' ),
		headline: __( 'Build custom blocks faster with Telex' ),
		subtitle: __( 'WordPress' ),
		description: __(
			'Ten tips for turning a prompt into a working WordPress block your clients can edit.'
		),
		primaryCta: {
			label: __( 'Read the tips' ),
			url: `${ BLOG }/from-concept-to-production-10-tips-for-building-custom-wordpress-blocks-with-telex-ai/`,
			isExternal: true,
		},
		when: { kind: 'started', date: '2026-09-30' },
	},
	{
		id: 'peak-season-debrief',
		type: 'event',
		logo: 'woo',
		eyebrow: __( 'Webinar · 11 AM ET' ),
		headline: __( 'Peak season debrief: what worked for agency stores' ),
		subtitle: __( 'Automattic for Agencies & WooCommerce' ),
		description: __(
			'Partners share what held up during Black Friday and Cyber Monday, and what they will change next year.'
		),
		primaryCta: {
			label: __( 'RSVP' ),
			url: `${ BLOG }/your-black-friday-playbook-how-to-prepare-for-peak-season/`,
			isExternal: true,
		},
		secondaryCta: {
			label: __( 'Add to calendar' ),
			url: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Peak%20season%20debrief&dates=20261208T160000Z/20261208T170000Z',
			isExternal: true,
		},
		when: { kind: 'event', date: '2026-12-08T16:00:00Z' },
	},
];
