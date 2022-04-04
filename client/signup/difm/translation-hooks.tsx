import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	HOME_PAGE,
	BLOG_PAGE,
	CONTACT_PAGE,
	ABOUT_PAGE,
	PHOTO_GALLERY_PAGE,
	SERVICE_SHOWCASE_PAGE,
	VIDEO_GALLERY_PAGE,
	PODCAST_PAGE,
	PORTFOLIO_PAGE,
	FAQ_PAGE,
	SITEMAP_PAGE,
	PROFILE_PAGE,
	MENU_PAGE,
	SERVICES_PAGE,
} from 'calypso/signup/difm/constants';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Provides the universal translated set of page titles available for DIFM
 *
 * @returns
 */
export function useTranslatedPageTitles() {
	const translate = useTranslate();
	const pages: Record< string, TranslateResult > = useMemo(
		() => ( {
			[ HOME_PAGE ]: translate( 'Home' ),
			[ BLOG_PAGE ]: translate( 'Blog' ),
			[ CONTACT_PAGE ]: translate( 'Contact' ),
			[ ABOUT_PAGE ]: translate( 'About' ),
			[ PHOTO_GALLERY_PAGE ]: translate( 'Photo Gallery' ),
			[ SERVICE_SHOWCASE_PAGE ]: translate( 'Showcase A Service' ),
			[ VIDEO_GALLERY_PAGE ]: translate( 'Video Gallery' ),
			[ PODCAST_PAGE ]: translate( 'Podcast' ),
			[ PORTFOLIO_PAGE ]: translate( 'Portfolio' ),
			[ FAQ_PAGE ]: translate( 'FAQ' ),
			[ SITEMAP_PAGE ]: translate( 'Sitemap' ),
			[ PROFILE_PAGE ]: translate( 'Profile' ),
			[ MENU_PAGE ]: translate( 'Menu' ),
			[ SERVICES_PAGE ]: translate( 'Services' ),
		} ),
		[ translate ]
	);
	return pages;
}
