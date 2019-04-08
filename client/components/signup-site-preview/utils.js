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
					position: relative;
					background: white;
				}
				.is-loading .site {
					opacity: 0;
				}
				
				.site {
					opacity: 1;
					transition: opacity 1s ease-in;
				}
				
				.wp-block-cover,
				img {
					animation: loading-animation 1.5s infinite;
					background-color: rgba( 0, 0, 0, 0.1 ) !important;
				}
				
				.spinner {
					display: none;
					position: absolute;
					top: 40px;
					width: 100%;
					z-index: 1000;
				}
				
				.is-loading .spinner {
					display: flex;
					align-items: center;
				}
				
				.spinner__outer, .spinner__inner {
					margin: auto;
					box-sizing: border-box;
					border: 0.1em solid transparent;
					border-radius: 50%;
					animation: 3s linear infinite;
					animation-name: rotate-spinner;
				}
				
				.spinner__outer {
					border-top-color: rgba( 0, 0, 0, 0.7 );
					width: 20px;
					height: 20px;
					font-size: 20px;
				}
				
				.spinner__inner {
					width: 100%;
					height: 100%;
					border-top-color: rgba( 0, 0, 0, 0.7 );
					border-right-color: rgba( 0, 0, 0, 0.7 );
					opacity: 0.4;
				}
				
				@keyframes loading-animation {
					0%   { background-color: rgba( 0, 0, 0, 0.7 ); }
					50%  { background-color: rgba( 0, 0, 0, 1 ); }
					100% { background-color: rgba( 0, 0, 0, 0.7 ); }
				}
				@keyframes rotate-spinner {
					100% {
						transform: rotate( 360deg );
					}
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
			<div class="spinner">
				<div class="spinner__outer">
					<div class="spinner__inner" />
				</div>
			</div>
		</body>
	</html>`;

	return URL.createObjectURL( new Blob( [ source ], { type: 'text/html' } ) );
}
