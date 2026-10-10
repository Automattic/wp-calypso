/**
 * PROTOTYPE — proof of concept only.
 *
 * Content for the “What’s new” card: events, announcements, and hand-picked
 * posts from automattic.com/for-agencies/blog. Each item is tagged with the
 * signup goals it serves, so the card can lead with what matters most to the
 * agency. Events are samples for the demo; announcements and blog posts are
 * real posts.
 */
import { __ } from '@wordpress/i18n';
import A4ALogo from 'calypso/assets/images/a8c-for-agencies/events/a4a-logo.svg';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/events/pressable-logo.svg';
import WooLogo from 'calypso/assets/images/a8c-for-agencies/events/woo-logo.svg';
import WordPressLogo from 'calypso/assets/images/a8c-for-agencies/events/wporg-logo-green.svg';
import type { SignupGoal } from './signup-profile';

export type UpdateKind = 'event' | 'announcement' | 'blog';

export interface UpdateItem {
	id: string;
	kind: UpdateKind;
	title: string;
	description: string;
	/** ISO date: when the event happens, or when the post was published. */
	date: string;
	url: string;
	goals: SignupGoal[];
	/** Event format, shown in the eyebrow (e.g. “Webinar”). */
	format?: string;
	/** Square logo shown beside events. */
	logo?: string;
	logoAlt?: string;
	/** Short host line under an event title, e.g. “Automattic for Agencies & Pressable”. */
	host?: string;
	/** Primary action label for events, e.g. “RSVP”. */
	ctaLabel?: string;
	imageUrl?: string;
}

const BLOG = 'https://automattic.com/for-agencies/blog';
const UPLOADS = 'https://automattic.com/wp-content/uploads';

export const getUpdates = (): UpdateItem[] => [
	// Events (samples for the prototype).
	{
		id: 'event-ai-visibility-workshop',
		kind: 'event',
		format: __( 'Webinar' ),
		logo: A4ALogo,
		logoAlt: __( 'Automattic for Agencies' ),
		host: __( 'Automattic for Agencies & WordPress VIP' ),
		ctaLabel: __( 'Save your spot' ),
		title: __( 'Run an AI visibility audit for a client, live' ),
		description: __(
			'Watch an Amplify audit run start to finish, then turn the findings into a scoped project.'
		),
		date: '2026-10-22T15:00:00Z',
		url: `${ BLOG }/from-audit-to-action-how-agencies-can-close-the-ai-visibility-gap/`,
		goals: [ 'optimize_operations', 'more_leads' ],
	},
	{
		id: 'event-pressable-office-hours',
		kind: 'event',
		format: __( 'Office hours' ),
		logo: PressableLogo,
		logoAlt: __( 'Pressable' ),
		host: __( 'Pressable' ),
		ctaLabel: __( 'Book a slot' ),
		title: __( 'Pressable migration office hours' ),
		description: __(
			'Bring your site list. The Pressable team will help you plan moves before peak season.'
		),
		date: '2026-10-29T16:00:00Z',
		url: `${ BLOG }/moving-client-sites-to-pressable-seven-things-to-get-right/`,
		goals: [ 'better_hosting', 'passive_income' ],
	},
	{
		id: 'event-referrals-masterclass',
		kind: 'event',
		format: __( 'Workshop' ),
		logo: WooLogo,
		logoAlt: __( 'WooCommerce' ),
		host: __( 'Automattic for Agencies & WooCommerce' ),
		ctaLabel: __( 'RSVP' ),
		title: __( 'Turn retainers into recurring commissions' ),
		description: __(
			'How partners use referral carts and WooPayments to earn on work they already do.'
		),
		date: '2026-11-05T16:00:00Z',
		url: `${ BLOG }/referral-invoice-branding/`,
		goals: [ 'passive_income', 'more_leads' ],
	},
	{
		id: 'event-wordcamp-us',
		kind: 'event',
		format: __( 'In person' ),
		logo: WordPressLogo,
		logoAlt: __( 'WordPress' ),
		host: __( 'WordCamp' ),
		ctaLabel: __( 'See the schedule' ),
		title: __( 'Meet the A4A team at the next WordCamp' ),
		description: __( 'Stop by the Automattic for Agencies booth to meet partner managers.' ),
		date: '2026-11-18T14:00:00Z',
		url: 'https://central.wordcamp.org/schedule/',
		goals: [ 'more_leads', 'other' ],
	},

	// Announcements (real posts).
	{
		id: 'announcement-pressable-playbook',
		kind: 'announcement',
		title: __( 'New: the Pressable Migration Playbook' ),
		description: __( 'Seven things to get right when you move client sites to Pressable.' ),
		date: '2026-10-07',
		url: `${ BLOG }/moving-client-sites-to-pressable-seven-things-to-get-right/`,
		goals: [ 'better_hosting' ],
	},
	{
		id: 'announcement-mcp',
		kind: 'announcement',
		title: __( 'Our new MCP brings A4A into your AI workflow' ),
		description: __(
			'Connect Claude, ChatGPT, Cursor, and more to your account for on-demand answers and reports.'
		),
		date: '2026-09-10',
		url: `${ BLOG }/our-new-mcp-brings-automattic-for-agencies-into-your-ai-workflow/`,
		goals: [ 'optimize_operations' ],
	},
	{
		id: 'announcement-referral-branding',
		kind: 'announcement',
		title: __( 'Your referrals now look as good as your agency' ),
		description: __(
			'Add your logo to referral emails, preview what clients see, and share a direct checkout link.'
		),
		date: '2026-03-11',
		url: `${ BLOG }/referral-invoice-branding/`,
		goals: [ 'passive_income' ],
	},
	{
		id: 'announcement-radical-speed',
		kind: 'announcement',
		title: __( 'Radical Speed Month: built fast, built for agencies' ),
		description: __( 'What the A4A team shipped in a month of small, focused pairs.' ),
		date: '2026-06-05',
		url: `${ BLOG }/radical-speed-month-built-fast-built-for-agencies/`,
		goals: [ 'other' ],
	},

	// Hand-picked blog posts (real posts).
	{
		id: 'blog-super-digital',
		kind: 'blog',
		title: __( 'How Super Digital turned two referrals into paid projects' ),
		description: __(
			'Two qualified referrals arrived within weeks of joining. Both became paid work.'
		),
		date: '2026-04-01',
		url: `${ BLOG }/how-super-digital-turned-two-referrals-into-paid-projects-within-weeks-of-joining-automattic-for-agencies/`,
		imageUrl: `${ UPLOADS }/2026/03/super-digital-case-study.png`,
		goals: [ 'more_leads', 'passive_income' ],
	},
	{
		id: 'blog-credential-gap',
		kind: 'blog',
		title: __( 'The credential gap that’s costing agencies enterprise deals' ),
		description: __( 'Why enterprise RFPs disappear, and how certified teams win them back.' ),
		date: '2026-06-15',
		url: `${ BLOG }/the-credential-gap-thats-costing-agencies-enterprise-deals/`,
		imageUrl: `${ UPLOADS }/2026/06/how-certified-wordpress-teams-close-the-ai-era-enterprise-skills-gap.png`,
		goals: [ 'more_leads' ],
	},
	{
		id: 'blog-mind-the-gaps',
		kind: 'blog',
		title: __( 'Mind the gaps: positioning for better-fit inquiries' ),
		description: __( 'Takeaways from our AgencyHabits fireside chat on how clients buy now.' ),
		date: '2026-05-21',
		url: `${ BLOG }/mind-the-gaps-key-takeaways-from-the-automattic-for-agencies-and-agencyhabits-fireside-chat/`,
		imageUrl: `${ UPLOADS }/2026/05/goldcast-email-banner.png`,
		goals: [ 'more_leads' ],
	},
	{
		id: 'blog-black-friday',
		kind: 'blog',
		title: __( 'Your Black Friday playbook' ),
		description: __( 'When to start, what to test, and how to sort client stores by risk.' ),
		date: '2026-09-30',
		url: `${ BLOG }/your-black-friday-playbook-how-to-prepare-for-peak-season/`,
		imageUrl: `${ UPLOADS }/2026/09/a4a-webinar-banner-uud8klyf.png`,
		goals: [ 'passive_income', 'better_hosting' ],
	},
	{
		id: 'blog-pressable-migration',
		kind: 'blog',
		title: __( 'Moving client sites to Pressable: seven things to get right' ),
		description: __( 'Avoid the small mistakes that cause most migration problems.' ),
		date: '2026-10-07',
		url: `${ BLOG }/moving-client-sites-to-pressable-seven-things-to-get-right/`,
		imageUrl: `${ UPLOADS }/2026/10/a4a-pressable-migration-2.png`,
		goals: [ 'better_hosting' ],
	},
	{
		id: 'blog-owup',
		kind: 'blog',
		title: __( 'How OWUP cut debugging time from days to minutes' ),
		description: __( 'Pressable MCP across 60+ WooCommerce sites, and new business the same day.' ),
		date: '2026-06-03',
		url: `${ BLOG }/how-owup-used-automattic-for-agencies-tools-to-cut-debugging-time-from-days-to-minutes/`,
		imageUrl: `${ UPLOADS }/2026/06/image-5.png`,
		goals: [ 'optimize_operations', 'better_hosting' ],
	},
	{
		id: 'blog-ai-visibility',
		kind: 'blog',
		title: __( 'From audit to action: closing the AI visibility gap' ),
		description: __( 'Four ways to act on an AI audit, what to do first, and who owns it.' ),
		date: '2026-09-30',
		url: `${ BLOG }/from-audit-to-action-how-agencies-can-close-the-ai-visibility-gap/`,
		imageUrl: `${ UPLOADS }/2026/09/building-an-ai-ready-discoverability-strategy-e28094-session-2-thumb.jpg`,
		goals: [ 'optimize_operations' ],
	},
	{
		id: 'blog-scale-delivery',
		kind: 'blog',
		title: __( 'How agencies use A4A to scale delivery and protect margins' ),
		description: __( 'Managing the complexity that comes with more clients and more sites.' ),
		date: '2026-03-03',
		url: `${ BLOG }/how-agencies-use-automattic-for-agencies-to-scale-delivery-and-protect-margins/`,
		imageUrl: `${ UPLOADS }/2026/02/how-agencies-use-automattic-for-agencies-to-scale-delivery-and-protect-margins.png`,
		goals: [ 'optimize_operations' ],
	},
];

/**
 * Items of one kind. Announcements are ordered by how closely they match the
 * agency's ranked goals (best match first), then newest first. Blog posts pick
 * the best matches the same way but are listed newest first. Events are
 * upcoming only, soonest first.
 */
export function getRankedUpdates( kind: UpdateKind, goals: SignupGoal[], limit = 4 ) {
	const now = Date.now();
	const rankOf = ( item: UpdateItem ) => {
		const ranks = item.goals
			.map( ( goal ) => goals.indexOf( goal ) )
			.filter( ( rank ) => rank >= 0 );
		return ranks.length ? Math.min( ...ranks ) : goals.length + 1;
	};

	return (
		getUpdates()
			.filter( ( item ) => item.kind === kind )
			.filter( ( item ) => kind !== 'event' || new Date( item.date ).getTime() > now )
			.sort( ( a, b ) => {
				// Events read best as a calendar, so they stay in date order.
				const byGoal = kind === 'event' ? 0 : rankOf( a ) - rankOf( b );
				if ( byGoal !== 0 ) {
					return byGoal;
				}
				const byDate = new Date( a.date ).getTime() - new Date( b.date ).getTime();
				// Events: soonest first. Posts: newest first.
				return kind === 'event' ? byDate : -byDate;
			} )
			.slice( 0, limit )
			// Blog: keep the most relevant picks, but list them newest first.
			.sort( ( a, b ) =>
				kind === 'blog' ? new Date( b.date ).getTime() - new Date( a.date ).getTime() : 0
			)
	);
}
