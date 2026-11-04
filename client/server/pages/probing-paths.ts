// Paths requested by bots and crawlers rather than by people following a broken
// dashboard link, so their 404s are tracked under a separate stat.
const PROBING_PATHS = new Set( [
	'/.aws/credentials',
	'/.env',
	'/.env.bak',
	'/.env.dev',
	'/.env.local',
	'/.env.old',
	'/.env.production',
	'/.git/HEAD',
	'/.git/config',
	'/.htaccess',
	'/.htpasswd',
	'/.svn/entries',
	'/Dockerfile',
	'/docker-compose.yml',
	'/image-sitemap.xml',
	'/news-sitemap.xml',
	'/page-sitemap.xml',
	'/phpmyadmin',
	'/post-sitemap.xml',
	'/product-sitemap.xml',
	'/sitemap-index.xml',
	'/sitemap.php',
	'/sitemap.txt',
	'/sitemap.xml',
	'/sitemap.xml.gz',
	'/sitemap/sitemap.xml',
	'/sitemap1.xml',
	'/sitemap_index.xml',
	'/sitemap_index.xml.gz',
	'/sitemaps/sitemap.xml',
	'/video-sitemap.xml',
	'/wp-sitemap.xml',
] );

export function isProbingPath( path: string ): boolean {
	return PROBING_PATHS.has( path.replace( /\/+$/, '' ) );
}
