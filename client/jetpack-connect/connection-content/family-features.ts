import { __ } from '@wordpress/i18n';

/**
 * Identifier for a single feature card rendered in the unified connection
 * flow's "What you'll get" section.
 *
 * Most cards are family-level summaries (`a4a`, `woo`, `jetpack`). The
 * `jetpack-*` keys are per-plugin overrides used when *exactly one* Jetpack
 * sub-plugin is active (and the full Jetpack plugin is not) — that single-
 * plugin context lets the card be more specific than the generic family
 * card. The `other` key is the empty-recognized-families fallback.
 *
 * The card key set is consumer-driven: every key is rendered by exactly the
 * same `<FeaturesSection />` component using the data returned from
 * `getFeatureCardData()`.
 */
export type FeatureCardKey =
	| 'a4a'
	| 'woo'
	| 'jetpack'
	| 'jetpack-backup'
	| 'jetpack-protect'
	| 'jetpack-boost'
	| 'jetpack-search'
	| 'jetpack-social'
	| 'jetpack-videopress'
	| 'other';

/**
 * Pre-composed copy for a single feature card.
 *
 * Each bullet is wrapped individually with `__()` so translators receive a
 * complete sentence — the card layout doesn't add any extra glue copy.
 */
export interface FeatureCardData {
	title: string;
	bullets: string[];
}

/**
 * Resolve the title + bullet copy for a feature card.
 *
 * The card data is intentionally static per key — site-vs-store wording is
 * already owned by the surface subtitle (`copy.ts`); the cards themselves
 * stay focused on what the listed plugin actually does. That keeps each
 * bullet a translator-ready full sentence that doesn't depend on any
 * runtime composition.
 *
 * Bullet[0] invariant: every non-A4A card's first bullet must read
 * sensibly in isolation and in an audience-neutral voice ("the site",
 * "the store", no second-person "your"). When A4A is also among the
 * active plugins, `getConnectorFeatureCards` slices supporting cards
 * down to just `bullets[0]` so the agency context isn't drowned out by
 * end-user-focused benefits. Bullets 1 and 2 can keep a warmer personal
 * voice — they only render when A4A is absent.
 */
export function getFeatureCardData( key: FeatureCardKey ): FeatureCardData {
	switch ( key ) {
		case 'a4a':
			return {
				title: __( 'Automattic for Agencies' ),
				bullets: [
					__( 'Manage every client site from a single dashboard.' ),
					__( 'Centralized billing, licensing, and team access.' ),
					__( 'Real-time site health and security insights.' ),
				],
			};

		case 'woo':
			return {
				title: __( 'WooCommerce' ),
				bullets: [
					__( 'Manage store orders, payments, and analytics from WordPress.com.' ),
					__( 'Run your store on the go with the Woo mobile app.' ),
					__( 'Accept secure payments and process refunds with WooPayments.' ),
				],
			};

		case 'jetpack':
			return {
				title: __( 'Jetpack' ),
				bullets: [
					__( 'Real-time backups, security scanning, and downtime monitoring.' ),
					__( 'Site speed and performance optimizations.' ),
					__( 'Detailed visitor stats and growth tools.' ),
				],
			};

		case 'jetpack-backup':
			return {
				title: __( 'Jetpack VaultPress Backup' ),
				bullets: [
					__( 'Real-time, off-site backups for every change.' ),
					__( 'One-click restore from any device, even if your site is down.' ),
					__( 'An activity log of every change, so you can see exactly what to restore.' ),
				],
			};

		case 'jetpack-protect':
			return {
				title: __( 'Jetpack Protect' ),
				bullets: [
					__( 'Daily malware and vulnerability scans.' ),
					__( 'Automatic threat intelligence updates.' ),
					__( 'Block brute-force login attacks before they land.' ),
				],
			};

		case 'jetpack-boost':
			return {
				title: __( 'Jetpack Boost' ),
				bullets: [
					__( 'One-click site speed optimizations.' ),
					__( 'Defer non-essential JavaScript so pages render faster.' ),
					__( 'Automatic image and CSS optimization.' ),
				],
			};

		case 'jetpack-search':
			return {
				title: __( 'Jetpack Search' ),
				bullets: [
					__( 'Instant, relevant results as visitors type.' ),
					__( 'Filter by tag, category, author, and date.' ),
					__( 'A customizable look and feel that matches your site.' ),
				],
			};

		case 'jetpack-social':
			return {
				title: __( 'Jetpack Social' ),
				bullets: [
					__( "Auto-publish new posts to the site's connected social networks." ),
					__( 'Schedule shares for the perfect time.' ),
					__( 'Resurface older posts to keep them in front of new readers.' ),
				],
			};

		case 'jetpack-videopress':
			return {
				title: __( 'Jetpack VideoPress' ),
				bullets: [
					__( 'Ad-free, branded video hosting.' ),
					__( 'Up to 4K resolution streamed seamlessly to every device.' ),
					__( 'Native integration with the WordPress block editor.' ),
				],
			};

		case 'other':
		default:
			return {
				title: __( 'Your active plugins' ),
				bullets: [
					__( 'Power any plugin features that need a Jetpack connection.' ),
					__( 'Keep your site and account in sync with WordPress.com.' ),
				],
			};
	}
}

/**
 * Resolve the title + bullet copy for a secondary admin connection card.
 *
 * Secondary connections (any user connecting after the site owner) enable
 * a narrower set of features than the owner connection. Every secondary
 * card is exactly one management-voice bullet so the row stays scannable
 * regardless of how many families are present.
 *
 * SSO is intentionally not surfaced here. It is bundled with the full
 * Jetpack plugin only — A4A, Woo, and the individual jetpack-* plugins
 * do not ship it — so listing it on any other card would be incorrect,
 * and singling out the generic Jetpack card with a second bullet would
 * break the uniform shape that lets the row scan cleanly.
 *
 * Bullets read in an audience-neutral voice ("this site", "this store")
 * so the same copy works whether the connecting user is an agency
 * teammate or a site co-owner who happens to care about the feature.
 */
export function getSecondaryFeatureCardData( key: FeatureCardKey ): FeatureCardData {
	switch ( key ) {
		case 'a4a':
			return {
				title: __( 'Automattic for Agencies' ),
				bullets: [ __( 'Access the agency dashboard to manage client sites.' ) ],
			};

		case 'woo':
			return {
				title: __( 'WooCommerce' ),
				bullets: [ __( 'Help manage this store — orders, payments, and analytics.' ) ],
			};

		case 'jetpack':
			return {
				title: __( 'Jetpack' ),
				bullets: [ __( 'Access the activity log to track every change on this site.' ) ],
			};

		case 'jetpack-backup':
			return {
				title: __( 'Jetpack VaultPress Backup' ),
				bullets: [ __( 'Monitor backup status and restore from Jetpack Cloud.' ) ],
			};

		case 'jetpack-protect':
			return {
				title: __( 'Jetpack Protect' ),
				bullets: [ __( 'View scan results and security status from Jetpack Cloud.' ) ],
			};

		case 'jetpack-boost':
			return {
				title: __( 'Jetpack Boost' ),
				bullets: [ __( 'View performance scores and optimization status.' ) ],
			};

		case 'jetpack-search':
			return {
				title: __( 'Jetpack Search' ),
				bullets: [ __( 'Manage search settings and customizations from Jetpack Cloud.' ) ],
			};

		case 'jetpack-social':
			return {
				title: __( 'Jetpack Social' ),
				bullets: [ __( 'Publish and schedule social media shares.' ) ],
			};

		case 'jetpack-videopress':
			return {
				title: __( 'Jetpack VideoPress' ),
				bullets: [ __( 'Manage videos and view analytics from Jetpack Cloud.' ) ],
			};

		case 'other':
		default:
			return {
				title: __( 'Your active plugins' ),
				bullets: [ __( 'Keep your site and account in sync with WordPress.com.' ) ],
			};
	}
}
