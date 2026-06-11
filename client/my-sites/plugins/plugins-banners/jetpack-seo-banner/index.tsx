import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { marketingTraffic } from 'calypso/my-sites/marketing/paths';

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
	/** Activates the SEO Tools module. Owned by the parent so this component stays presentational. */
	onEnableSeo?: () => void;
}

/**
 * A hint shown above SEO-related plugin search results, letting Dotcom users
 * know Jetpack already provides SEO tools. Depending on state it manages,
 * enables, or routes to the native Calypso SEO settings ( /marketing/traffic )
 * rather than sending them to install a third-party plugin.
 */
const JetpackSeoBanner = ( {
	siteId,
	siteSlug,
	searchTerm,
	isSeoModuleActive,
	hasAdvancedSeo,
	onEnableSeo,
}: JetpackSeoBannerProps ) => {
	const { __ } = useI18n();

	useEffect( () => {
		recordTracksEvent( 'calypso_plugins_jetpack_seo_hint_impression', {
			blog_id: siteId,
			search_term: searchTerm,
			seo_active: isSeoModuleActive,
		} );
	}, [ siteId, searchTerm, isSeoModuleActive ] );

	let cta: SeoHintCta = 'upsell';
	if ( isSeoModuleActive ) {
		cta = 'manage_seo';
	} else if ( hasAdvancedSeo ) {
		cta = 'enable_seo';
	}

	const handleClick = useCallback( () => {
		recordTracksEvent( 'calypso_plugins_jetpack_seo_hint_click', {
			blog_id: siteId,
			search_term: searchTerm,
			seo_active: isSeoModuleActive,
			cta,
		} );

		// Enable the module before the link navigates to the settings page, so the
		// user doesn't land on a page where SEO is unexpectedly still off.
		if ( cta === 'enable_seo' ) {
			onEnableSeo?.();
		}
	}, [ siteId, searchTerm, isSeoModuleActive, cta, onEnableSeo ] );

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
				href={ marketingTraffic( siteSlug ) }
				onClick={ handleClick }
			>
				{ ctaLabel }
			</Button>
		</div>
	);
};

export default JetpackSeoBanner;
