/** @format */

/**
 * Returns a theme base CSS URI.
 *
 * @param  {String}  themeSlug A theme slug, e.g., `pub/business`
 * @param  {Boolean} isRtl     If the current locale is a right-to-left language
 * @return {String}            The theme CSS URI.
 */
export function getThemeCssUri( themeSlug, isRtl ) {
	return `https://s0.wp.com/wp-content/themes/${ themeSlug }/style${ isRtl ? '-rtl' : '' }.css`;
}

/**
 * Returns entry content HTML
 *
 * @param  {Object} content Object containing `title`, `tagline` and `body` strings
 * @return {String}         The HTML source.
 */
export function getIframePageContent( { body, title, tagline } ) {
	return `
		<div class="entry-content">
			<div class="site-builder__header">
				<h1 class="site-builder__title">${ title }</h1>
				<h2 class="site-builder__description">${ tagline }</h2>
			</div>
			${ body }
		</div>`;
}

/**
 * Returns a WordPress page shell HTML
 *
 * @param  {Object}  content   Object containing `title`, `tagline` and `body` strings
 * @param  {String}  cssUrl    A URL to the theme CSS file
 * @param  {String}  fontUrl   A URL to the font CSS file
 * @param  {Boolean} isRtl     If the current locale is a right-to-left language
 * @param  {String}  langSlug  The slug of the current locale
 * @return {String}            The HTML source.
 */
export function getIframeSource( content, cssUrl, fontUrl, isRtl = false, langSlug = 'en' ) {
	const source = `
		<html lang="${ langSlug }" dir="${ isRtl ? 'rtl' : 'ltr' }">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<link rel="dns-prefetch" href="//s1.wp.com">
			<link rel="dns-prefetch" href="//fonts.googleapis.com">
			<title>${ content.title } – ${ content.tagline }</title>
			<link type="text/css" media="all" rel="stylesheet" href="https://s0.wp.com/wp-content/plugins/gutenberg-core/build/block-library/style.css" />
			<link type="text/css" media="all" rel="stylesheet" href="${ cssUrl }" />
			<link type="text/css" media="all" rel="stylesheet" href="${ fontUrl }" />
			<style type="text/css">
				.is-loading {
					background: white;
				}

				.is-loading .site,
				.loading-placeholder-container {
					display: none;
				}

				.is-loading .loading-placeholder-container {
					display: block;
					animation: loading-animation 1.5s infinite;
				}

				.loading-placeholder-container__header,
				.loading-placeholder-container__banner,
				.loading-placeholder-container__content {
					background-color: rgba( 0, 0, 0, 0.1 );
					margin: 0 auto 20px;
				}
				
				.loading-placeholder-container__header {
					margin-top: 20px;
					height: 75px;
					width: 75%;
				}
				
				.loading-placeholder-container__banner {
					height: 150px;
				}
				
				.loading-placeholder-container__content {
					height: 250px;
					width: 85%;
				}
				
				@keyframes loading-animation {
				  0%   { opacity:1; }
				  50%  { opacity:0; }
				  100% { opacity:1; }
				}
			</style>
		</head>
		<body class="home page-template-default page logged-in is-loading">
			<div id="page" class="site">
				<div id="content" class="site-content">
					<section id="primary" class="content-area">
						<main id="main" class="site-main">
							<article class="page type-page status-publish hentry entry">
								${ getIframePageContent( content ) }
							</article>
						</div>
					</section>
				</div>
			</div>
			<div class="loading-placeholder-container">
				<div class="loading-placeholder-container__header">&nbsp;</div>
				<div class="loading-placeholder-container__banner">&nbsp</div>
				<div class="loading-placeholder-container__content">&nbsp</div>
			</div>
		</body>
	</html>`;

	return URL.createObjectURL( new Blob( [ source ], { type: 'text/html' } ) );
}
