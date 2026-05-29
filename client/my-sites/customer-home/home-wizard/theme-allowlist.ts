/**
 * Curated theme set for the AI Launchpad's "Choose a theme" task.
 *
 * Dolly picks 3 of these for each user based on inferred vibe + niche.
 * Constraining to a known list (rather than letting Dolly free-form a slug)
 * means we can guarantee the activation API call works and the preview URL
 * loads. Same shape as the task-registry menu.
 *
 * To extend: add an entry, verify the demo URL loads, and re-run the prompt
 * verification harness so the picker still passes for representative
 * intents. No other code change needed — the allowlist drives both the
 * prompt menu and the post-response validation.
 */

export type ThemeEntry = {
	/** wpcom theme slug — used for both activation and preview URL. */
	slug: string;
	/** Display name shown in the card. */
	name: string;
	/** Full demo URL used by the iframe preview. */
	previewUrl: string;
	/**
	 * Vibe descriptors (aesthetic hints). Dolly matches the user's `inferred.vibe`
	 * against these. Multi-token is fine; the LLM does fuzzy matching.
	 */
	vibes: string[];
	/**
	 * Format / use-case descriptors. Dolly matches the user's `inferred.niche`
	 * and `inferred.goal` against these.
	 */
	categories: string[];
	/** One-line summary shown as a fallback if Dolly omits a `why`. */
	tagline: string;
};

export const THEME_ALLOWLIST: ThemeEntry[] = [
	// Tag philosophy: vibes + categories include the words Dolly is likely
	// to put into `inferred` (matched verbatim via substring against the
	// user's free-text intent). Synonyms matter — "jewelry" must overlap
	// with stewart, "vlog" must overlap with videomaker, etc. The recommend-
	// themes scorer uses two-way `includes` matching, so single-token tags
	// like "blog" will match "blogger", "blogging", etc. automatically.
	{
		slug: 'pendant',
		name: 'Pendant',
		previewUrl: 'https://pendantdemo.wordpress.com/',
		vibes: [
			'editorial',
			'minimal',
			'elegant',
			'serif',
			'writerly',
			'literary',
			'reflective',
			'slow',
			'thoughtful',
		],
		categories: [
			'blog',
			'writing',
			'newsletter',
			'magazine',
			'literature',
			'essays',
			'book',
			'reading',
			'author',
		],
		tagline: 'Editorial blog with elegant typography',
	},
	{
		slug: 'tsubaki',
		name: 'Tsubaki',
		// Note: wpcomstaging.com, not wordpress.com — the wordpress.com
		// subdomain 301s here. Direct URL avoids the redirect.
		previewUrl: 'https://tsubakidemo.wpcomstaging.com/',
		vibes: [
			'minimal',
			'calm',
			'japan',
			'japanese',
			'inspired',
			'soft',
			'muted',
			'serene',
			'quiet',
			'meditative',
			'understated',
		],
		categories: [
			'blog',
			'portfolio',
			'writing',
			'wellness',
			'yoga',
			'fitness',
			'meditation',
			'creative',
			'mindfulness',
			'photo',
			'photography',
			'travel',
		],
		tagline: 'Calm, Japanese-inspired layout with quiet typography',
	},
	{
		// Replaces `frost` (whose demo subdomain doesn't exist on wpcom).
		// Mysa is a Scandinavian-inspired minimal theme — fills the same
		// "clean, image-friendly" slot in the allowlist.
		slug: 'mysa',
		name: 'Mysa',
		previewUrl: 'https://mysademo.wordpress.com/',
		vibes: [ 'minimal', 'clean', 'crisp', 'modern', 'understated', 'spacious', 'scandinavian' ],
		categories: [
			'portfolio',
			'photography',
			'photo',
			'photos',
			'gallery',
			'visual',
			'creative',
			'blog',
			'images',
			'lifestyle',
			'travel',
		],
		tagline: 'Crisp minimal layout for image-first sites',
	},
	{
		slug: 'assembler',
		name: 'Assembler',
		previewUrl: 'https://assemblerdemo.wordpress.com/',
		vibes: [ 'modular', 'clean', 'flexible', 'professional', 'neutral', 'corporate' ],
		categories: [
			'business',
			'portfolio',
			'agency',
			'service',
			'general',
			'studio',
			'consulting',
			'company',
			'nonprofit',
			'organization',
			'charity',
			'wellness',
		],
		tagline: 'Flexible modular layout for service businesses',
	},
	{
		slug: 'appleton',
		name: 'Appleton',
		previewUrl: 'https://appletondemo.wordpress.com/',
		vibes: [ 'bold', 'typographic', 'editorial', 'expressive', 'confident', 'statement' ],
		categories: [ 'portfolio', 'creative', 'design', 'agency', 'designer', 'illustrator', 'art' ],
		tagline: 'Bold typographic portfolio for creatives',
	},
	{
		// Replaces `bricksy` (broken demo). Notebook is a clean modern blog
		// theme — fills the "friendly personal blog" slot in the allowlist.
		slug: 'notebook',
		name: 'Notebook',
		previewUrl: 'https://notebookdemo.wordpress.com/',
		vibes: [ 'modern', 'clean', 'friendly', 'simple', 'casual' ],
		categories: [
			'blog',
			'personal',
			'lifestyle',
			'general',
			'journal',
			'diary',
			'writing',
			'travel',
			'newsletter',
			'school',
			'education',
		],
		tagline: 'Simple, modern blog with a friendly voice',
	},
	{
		slug: 'messenger',
		name: 'Messenger',
		previewUrl: 'https://messengerdemo.wordpress.com/',
		vibes: [ 'warm', 'inviting', 'community', 'cozy', 'local', 'rustic', 'handmade', 'artisan' ],
		categories: [
			'business',
			'restaurant',
			'cafe',
			'local',
			'service',
			'food',
			'bakery',
			'shop',
			'studio',
			'yoga',
			'wellness',
			'fitness',
			'classes',
			'community',
			'nonprofit',
		],
		tagline: 'Warm local-business layout with menu/hours sections',
	},
	{
		slug: 'disco',
		name: 'Disco',
		previewUrl: 'https://discodemo.wordpress.com/',
		vibes: [ 'bold', 'energetic', 'vibrant', 'expressive', 'maximalist', 'fun', 'loud' ],
		categories: [
			'music',
			'events',
			'promo',
			'lifestyle',
			'creative',
			'band',
			'dj',
			'nightlife',
			'festival',
		],
		tagline: 'Energetic, vibrant layout for music and events',
	},
	{
		slug: 'videomaker',
		name: 'Videomaker',
		previewUrl: 'https://videomakerdemo.wordpress.com/',
		vibes: [ 'cinematic', 'bold', 'modern', 'dark', 'dramatic' ],
		// Note: dropped "travel" — a video-first theme isn't a generic travel
		// pick (a travel BLOG wants a blog theme). Travel vloggers will still
		// match here on "vlog" / "video" / "creator" tags.
		categories: [
			'video',
			'vlog',
			'vlogger',
			'film',
			'movies',
			'podcast',
			'youtube',
			'creator',
			'portfolio',
			'documentary',
			'reels',
		],
		tagline: 'Cinematic video-first layout for film and podcast creators',
	},
	{
		slug: 'course',
		name: 'Course',
		previewUrl: 'https://coursedemo.wordpress.com/',
		vibes: [ 'professional', 'structured', 'clean', 'trustworthy', 'instructional' ],
		categories: [
			'education',
			'teaching',
			'teacher',
			'memberships',
			'business',
			'service',
			'course',
			'class',
			'classes',
			'school',
			'coaching',
			'workshop',
			'learning',
			'nonprofit',
			'ngo',
			'charity',
			'instructor',
			'yoga',
			'fitness',
			'wellness',
			'training',
		],
		tagline: 'Structured layout for teaching and online courses',
	},
	{
		// Replaces `stewart` (broken demo). Cassel is a refined boutique-style
		// theme — fills the "small storefront / product catalog" slot.
		slug: 'cassel',
		name: 'Cassel',
		previewUrl: 'https://casseldemo.wordpress.com/',
		vibes: [ 'minimal', 'refined', 'understated', 'boutique', 'handmade', 'artisan', 'elegant' ],
		categories: [
			'store',
			'shop',
			'ecommerce',
			'product',
			'products',
			'jewelry',
			'ceramics',
			'clothing',
			'apparel',
			'goods',
			'selling',
			'boutique',
			'craft',
			'maker',
		],
		tagline: 'Refined boutique storefront for small product catalogs',
	},
	{
		slug: 'dorna',
		name: 'Dorna',
		previewUrl: 'https://dornademo.wordpress.com/',
		vibes: [ 'bold', 'editorial', 'magazine', 'serif', 'classic', 'newspapery' ],
		categories: [
			'blog',
			'magazine',
			'writing',
			'editorial',
			'journalism',
			'news',
			'review',
			'newsletter',
		],
		tagline: 'Classic magazine layout with bold headlines',
	},
];

export const THEME_SLUGS = new Set( THEME_ALLOWLIST.map( ( t ) => t.slug ) );

export function getTheme( slug: string ): ThemeEntry | undefined {
	return THEME_ALLOWLIST.find( ( t ) => t.slug === slug );
}
