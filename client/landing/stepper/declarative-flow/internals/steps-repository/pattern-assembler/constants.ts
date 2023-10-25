export const PATTERN_SOURCE_SITE_ID = 174455321; // dotcompatterns
export const PUBLIC_API_URL = 'https://public-api.wordpress.com';
export const SITE_TAGLINE = 'Site Tagline';

export const NAVIGATOR_PATHS = {
	MAIN: '/main',
	MAIN_HEADER: '/main/header',
	MAIN_FOOTER: '/main/footer',
	MAIN_PATTERNS: '/main/:categorySlug',
	SECTIONS: '/sections',
	SECTIONS_PATTERNS: '/sections/:categorySlug',
	STYLES: '/styles',
	STYLES_COLORS: '/styles/colors',
	STYLES_FONTS: '/styles/fonts',
	ACTIVATION: '/activation',
	CONFIRMATION: '/confirmation',
	UPSELL: '/upsell',
	PAGES: '/pages',
};

export const INITIAL_PATH = NAVIGATOR_PATHS.MAIN_HEADER;

export const INITIAL_SCREEN = 'main';

/* Category list of the patterns fetched via PTK API from Dotcompatterns
 *
 * The categories that are commented are not fetched because they
 *  - are hidden intentionaly in the Assembler only
 *  - don't exist in Dotcompatterns source site
 */
export const PATTERN_CATEGORIES = [
	//'featured', // -- Not exists
	'intro',
	'about',
	//'buttons', -- Not exist
	//'banner', -- Not exist
	//'query', -- Not exist
	'blog',
	'posts', // Reused as "Blog Posts"
	//'call-to-action', -- Hidden
	//'columns', -- Not exist
	//'coming-soon', -- Hidden
	'contact',
	'footer',
	'forms',
	'gallery',
	'header',
	//'link-in-bio', -- Hidden
	//'media', -- Not exist
	'newsletter',
	//'podcast', -- Hidden
	//'portfolio', -- Hidden
	//'quotes', -- Not exist
	'services',
	'store',
	//'team', -- Not exist
	'testimonials', // Reused as "Quotes"
	//'text', -- Hidden
];

export const ORDERED_PATTERN_CATEGORIES = [
	'intro',
	'about',
	'services',
	'store',
	'testimonials',
	'posts',
	'newsletter',
	'gallery',
	'contact',
];

export const INITIAL_CATEGORY = ORDERED_PATTERN_CATEGORIES[ 0 ];
