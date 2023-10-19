// Page ids
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
export const MENU_PAGE = 'MENU_PAGE';
export const SERVICES_PAGE = 'SERVICES_PAGE';
export const TESTIMONIALS_PAGE = 'TESTIMONIALS_PAGE';
export const PRICING_PAGE = 'PRICING_PAGE';
export const TEAM_PAGE = 'TEAM_PAGE';
export const SHOP_PAGE = 'SHOP_PAGE';
export const CUSTOM_PAGE = 'CUSTOM_PAGE';
export const CAREERS_PAGE = 'CAREERS_PAGE';
export const EVENTS_PAGE = 'EVENTS_PAGE';
export const DONATE_PAGE = 'DONATE_PAGE';
export const NEWSLETTER_PAGE = 'NEWSLETTER_PAGE';
export const CASE_STUDIES_PAGE = 'CASE_STUDIES_PAGE';

export type PageId =
	| typeof HOME_PAGE
	| typeof BLOG_PAGE
	| typeof CONTACT_PAGE
	| typeof ABOUT_PAGE
	| typeof PHOTO_GALLERY_PAGE
	| typeof VIDEO_GALLERY_PAGE
	| typeof PORTFOLIO_PAGE
	| typeof FAQ_PAGE
	| typeof SERVICES_PAGE
	| typeof TESTIMONIALS_PAGE
	| typeof PRICING_PAGE
	| typeof TEAM_PAGE
	| typeof SHOP_PAGE
	| typeof CUSTOM_PAGE
	| typeof CAREERS_PAGE
	| typeof EVENTS_PAGE
	| typeof DONATE_PAGE
	| typeof NEWSLETTER_PAGE
	| typeof CASE_STUDIES_PAGE;

export type DeprecatedPageIds =
	| typeof SERVICE_SHOWCASE_PAGE
	| typeof PODCAST_PAGE
	| typeof SITEMAP_PAGE
	| typeof PROFILE_PAGE
	| typeof MENU_PAGE;
