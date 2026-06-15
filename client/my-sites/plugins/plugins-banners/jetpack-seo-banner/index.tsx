import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useRef, type SyntheticEvent } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';

import './style.scss';

/**
 * Search terms that signal SEO intent: generic SEO terms, feature terms, and
 * common third-party SEO plugin names. Used to decide when to surface the
 * "Jetpack already includes SEO tools" hint in the plugins browser.
 */
const SEO_SEARCH_TERMS = [
	'seo',
	'sitemap',
	'meta description',
	'open graph',
	'opengraph',
	'title tag',
	'schema',
	'breadcrumb',
	'yoast',
	'rank math',
	'rankmath',
	'all in one seo',
	'all-in-one-seo',
	'aioseo',
	'the seo framework',
];

/**
 * Whether a plugin-browser search query expresses SEO intent.
 * @param searchTerm The raw search query.
 * @returns True when the query matches a known SEO term, feature, or competitor name.
 */
export function isSeoSearch( searchTerm?: string | null ): boolean {
	if ( ! searchTerm ) {
		return false;
	}

	const normalized = searchTerm.toLowerCase();
	return SEO_SEARCH_TERMS.some( ( term ) => normalized.includes( term ) );
}

type SeoHintCta = 'manage_seo' | 'enable_seo' | 'upsell';

interface JetpackSeoBannerProps {
	siteId: number | null;
	siteSlug?: string | null;
	searchTerm: string;
	/** Whether the Jetpack SEO Tools module is already active. */
	isSeoModuleActive: boolean;
	/** Whether the site's plan includes advanced SEO ( so the module can be enabled ). */
	hasAdvancedSeo: boolean;
	/** wp-admin URL of the Jetpack SEO page ( admin.php?page=jetpack-seo ), or null if unavailable. */
	seoAdminUrl: string | null;
	/** Activates the SEO Tools module; resolves once the module is active. Owned by the parent so this component stays presentational. */
	onEnableSeo: () => Promise< void > | void;
}

/**
 * A hint shown above SEO-related plugin search results, letting Dotcom users
 * know Jetpack already provides SEO tools. Depending on state it manages,
 * enables, or routes to the Jetpack SEO admin page ( admin.php?page=jetpack-seo )
 * rather than sending them to install a third-party plugin.
 */
const JetpackSeoBanner = ( {
	siteId,
	siteSlug,
	searchTerm,
	isSeoModuleActive,
	hasAdvancedSeo,
	seoAdminUrl,
	onEnableSeo,
}: JetpackSeoBannerProps ) => {
	const { __ } = useI18n();

	// Track which ( site, search ) context we've already counted an impression for,
	// so toggling `isSeoModuleActive` mid-view ( e.g. after the CTA enables the
	// module ) doesn't re-fire — and double-count — the impression.
	const recordedImpressionKey = useRef< string | null >( null );

	useEffect( () => {
		// Only count an impression when the banner actually renders ( see the
		// siteSlug guard below ), otherwise we'd inflate impressions on surfaces
		// with no site context.
		if ( ! siteSlug ) {
			return;
		}

		const impressionKey = `${ siteId }:${ searchTerm }`;
		if ( recordedImpressionKey.current === impressionKey ) {
			return;
		}
		recordedImpressionKey.current = impressionKey;

		recordTracksEvent( 'calypso_plugins_jetpack_seo_hint_impression', {
			blog_id: siteId,
			search_term: searchTerm,
			seo_active: isSeoModuleActive,
		} );
	}, [ siteId, siteSlug, searchTerm, isSeoModuleActive ] );

	let cta: SeoHintCta = 'upsell';
	if ( isSeoModuleActive ) {
		cta = 'manage_seo';
	} else if ( hasAdvancedSeo ) {
		cta = 'enable_seo';
	}

	const handleClick = useCallback(
		async ( event: SyntheticEvent ) => {
			recordTracksEvent( 'calypso_plugins_jetpack_seo_hint_click', {
				blog_id: siteId,
				search_term: searchTerm,
				seo_active: isSeoModuleActive,
				cta,
			} );

			if ( ! seoAdminUrl ) {
				return;
			}

			// Drive the navigation ourselves instead of letting the anchor's href do
			// it, so we can activate the module first and route through `navigate`
			// ( which wraps the destination with logmein for seamless wp-admin auth ).
			event.preventDefault();

			// The Jetpack SEO admin page only exists while the SEO Tools module is
			// active, so whenever it's off — both the "enable" and "set up" states —
			// activate it and await that before leaving, otherwise the user can land
			// on a page that isn't registered yet.
			if ( ! isSeoModuleActive ) {
				await onEnableSeo();
			}

			navigate( seoAdminUrl );
		},
		[ siteId, searchTerm, isSeoModuleActive, cta, seoAdminUrl, onEnableSeo ]
	);

	if ( ! siteSlug ) {
		return null;
	}

	const ctaLabel = {
		manage_seo: __( 'Manage SEO settings' ),
		enable_seo: __( 'Enable Jetpack SEO' ),
		upsell: __( 'Set up Jetpack SEO' ),
	}[ cta ];

	return (
		<div className="jetpack-seo-banner">
			<div className="jetpack-seo-banner__content">
				<h3 className="jetpack-seo-banner__title">
					{ __( 'Jetpack already includes SEO tools' ) }
				</h3>
				<p className="jetpack-seo-banner__description">
					{ __(
						'Optimize titles, meta descriptions, sitemaps, and social previews without installing another plugin.'
					) }
				</p>
			</div>
			<Button
				className="jetpack-seo-banner__cta"
				variant="secondary"
				href={ seoAdminUrl ?? undefined }
				onClick={ handleClick }
			>
				{ ctaLabel }
			</Button>
		</div>
	);
};

export default JetpackSeoBanner;
