/**
 * Exact-match TLDs, in display order.
 */
export const NAME_PULSE_TLDS: readonly string[] = [
	'blog',
	'com',
	'net',
	'org',
	'info',
	'ca',
	'co',
	'io',
	'site',
	'online',
	'tech',
	'store',
	'club',
	'xyz',
	'app',
	'dev',
	'space',
	'live',
	'life',
	'one',
	'shop',
	'top',
	'art',
	'me',
	'cc',
	'tv',
	'design',
	'ai',
	'pro',
	'mobi',
	'be',
	'fm',
	'page',
	'education',
	'inc',
	'email',
	'news',
	'media',
	'studio',
	'video',
	'digital',
	'website',
	'network',
	'company',
	'business',
	'ventures',
	'agency',
	'management',
	'consulting',
	'services',
	'solutions',
	'center',
	'international',
	'global',
	'world',
	'enterprises',
	'ltd',
	'llc',
	'group',
	'partners',
];

/**
 * TLDs preferred for the "Top results" cards, in order.
 */
export const NAME_PULSE_TOP_RESULTS_TLDS: readonly string[] = [ 'blog', 'com', 'app', 'dev' ];

export const NAME_PULSE_TOP_RESULTS_COUNT = 3;

/**
 * Rows per "Show more" click and initial rows per section.
 */
export const NAME_PULSE_PAGE_SIZE = 12;

/**
 * Domains per availability-check request (endpoint maximum is 50).
 */
export const NAME_PULSE_AVAILABILITY_BATCH_SIZE = 36;

/**
 * Exact-match rows checked as soon as a query settles. Single-word searches
 * check a full batch; multi-word searches check the first page plus a buffer.
 */
export const NAME_PULSE_INITIAL_CHECK_SINGLE_WORD = 36;
export const NAME_PULSE_INITIAL_CHECK_MULTI_WORD = 24;

/**
 * Word count at which the search switches to AI mode (creative suggestions,
 * exact grid hidden).
 */
export const NAME_PULSE_AI_MODE_MIN_WORDS = 4;

/**
 * How long skeleton slots and "checking" rows wait for a response before giving up.
 */
export const NAME_PULSE_SKELETON_TIMEOUT_MS = 10000;
