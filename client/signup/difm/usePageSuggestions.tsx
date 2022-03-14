import { useTranslate } from 'i18n-calypso';
import type { TranslateResult } from 'i18n-calypso';

export const HOME_PAGE = 'HOME_PAGE';
export const BLOG_PAGE = 'BLOG_PAGE';
export const CONTACT_PAGE = 'CONTACT_PAGE';
export const ABOUT_PAGE = 'ABOUT_PAGE';
export const PHOTO_GALLERY_PAGE = 'PHOTO_GALLERY_PAGE';
export const SERVICE_SHOWCASE_PAGE = 'SERVICE_SHOWCASE_PAGE';
export const VIDEO_GALLERY_PAGE = 'VIDEO_GALLERY_PAGE';
export const PODCAST_PAGE = 'PODCAST_PAGE';
export const PORTFOLIO_PAGE = 'PORTFOLIO_PAGE';
export const FAQ_PAGE = 'FAQ_PAGE';
export const SITEMAP_PAGE = 'SITEMAP_PAGE';
export const PROFILE_PAGE = 'PROFILE_PAGE';

export interface PageSuggestion {
	id: string;
	title: TranslateResult;
	isPopular?: boolean;
}

export default function usePageSuggestions() {
	const translate = useTranslate();
	const pages: Record< string, PageSuggestion > = {
		[ HOME_PAGE ]: { id: HOME_PAGE, title: translate( 'Home' ), isPopular: true },
		[ BLOG_PAGE ]: { id: BLOG_PAGE, title: translate( 'Blog' ), isPopular: true },
		[ CONTACT_PAGE ]: { id: CONTACT_PAGE, title: translate( 'Contact' ), isPopular: true },
		[ ABOUT_PAGE ]: { id: ABOUT_PAGE, title: translate( 'About' ), isPopular: true },
		[ PHOTO_GALLERY_PAGE ]: { id: PHOTO_GALLERY_PAGE, title: translate( 'Photo Gallery' ) },
		[ SERVICE_SHOWCASE_PAGE ]: {
			id: SERVICE_SHOWCASE_PAGE,
			title: translate( 'Showcase a service' ),
		},
		[ VIDEO_GALLERY_PAGE ]: { id: VIDEO_GALLERY_PAGE, title: translate( 'Video gallery' ) },
		[ PODCAST_PAGE ]: { id: PODCAST_PAGE, title: translate( 'Podcast' ) },
		[ PORTFOLIO_PAGE ]: { id: PORTFOLIO_PAGE, title: translate( 'Portfolio' ) },
		[ FAQ_PAGE ]: { id: FAQ_PAGE, title: translate( 'FAQ' ) },
		[ SITEMAP_PAGE ]: { id: SITEMAP_PAGE, title: translate( 'Sitemap' ) },
		[ PROFILE_PAGE ]: { id: PROFILE_PAGE, title: translate( 'Profile' ) },
	};
	return pages;
}
