export const DOTCOM_DASHBOARD_SECTION_DEFINITION = {
	name: 'dashboard-dotcom',
	module: 'dashboard/app-dotcom',
	// The dotcom dashboard renders its page headings (`--dashboard-h1__font-family`)
	// in Recoleta, fetched from s1.wp.com. Warm the connection and preload the font
	// so it arrives before first paint, avoiding the fallback-to-Recoleta swap (FOUT).
	//
	// The preload `href` below mirrors the canonical `@font-face` `src` declared in
	// `@automattic/typography` (styles/fonts.scss). A preload that points at a URL the
	// stylesheet no longer uses is worse than none — the browser downloads a file
	// nothing consumes — so `test/section.test.ts` fails if the two ever diverge.
	links: [
		{
			rel: 'preconnect',
			href: 'https://s1.wp.com',
			crossOrigin: 'anonymous',
		},
		{
			rel: 'preload',
			as: 'font',
			type: 'font/woff2',
			href: 'https://s1.wp.com/i/fonts/recoleta/extended/recoleta-400.woff2',
			crossOrigin: 'anonymous',
		},
	],
};
