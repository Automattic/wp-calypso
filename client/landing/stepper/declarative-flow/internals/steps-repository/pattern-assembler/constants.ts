export const PATTERN_SOURCE_SITE_ID = 174455321; // dotcompatterns
export const PUBLIC_API_URL = 'https://public-api.wordpress.com';
export const SITE_TAGLINE = 'Site Tagline';

// Workaround to put the category All in the first position using featured as slug
export const CATEGORY_ALL_SLUG = 'featured';

export const NAVIGATOR_PATHS = {
	MAIN: '/',
	HEADER: '/header',
	SECTION_PATTERNS: '/section/patterns',
	FOOTER: '/footer',
	COLOR_PALETTES: '/color-palettes',
	FONT_PAIRINGS: '/font-pairings',
	ACTIVATION: '/activation',
};

export const STYLES_PATHS = [ NAVIGATOR_PATHS.COLOR_PALETTES, NAVIGATOR_PATHS.FONT_PAIRINGS ];

/* Category list of the patterns fetched via PTK API from Dotcompatterns
 *
 * The categories that are commented are not fetched because they
 *  - are hidden intentionaly in the Assembler only
 *  - don't exist in Dotcompatterns source site
 */
export const PATTERN_CATEGORIES = [
	'featured', // Reused for "All" category
	'about',
	//'buttons', -- Not exist
	//'banner', -- Not exist
	//'query', -- Not exist
	'blog',
	'posts', // Reused as "Blog Posts"
	'call-to-action',
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
	'podcast',
	'portfolio',
	'quotes',
	'services',
	'store',
	//'team', -- Not exist
	'testimonials',
	'text',
];
