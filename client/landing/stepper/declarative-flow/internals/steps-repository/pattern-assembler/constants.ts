export const PATTERN_SOURCE_SITE_ID = 174455321; // dotcompatterns
export const STYLE_SHEET = 'pub/blank-canvas-blocks';
export const PUBLIC_API_URL = 'https://public-api.wordpress.com';
export const PREVIEW_PATTERN_URL = PUBLIC_API_URL + '/wpcom/v2/block-previews/pattern';

export const CUSTOM_HOME_PAGE_TEMPLATE_CONTENT = {
	HEADER: '<!-- wp:template-part {"slug":"header","tagName":"header"} /-->',
	MAIN: `
<!-- wp:group {"tagName":"main","lock":{"move":false,"remove":true}} -->
<main class="wp-block-group">

<!-- wp:post-content {"layout":{"inherit":true},"lock":{"move":false,"remove":true}} /-->
</main>
<!-- /wp:group -->
`,
	FOOTER:
		'<!-- wp:template-part {"slug":"footer","tagName":"footer","className":"site-footer-container"} /-->',
};
