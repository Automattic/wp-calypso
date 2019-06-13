/** @format */

/**
 * Internal dependencies
 */

// Detect IE 11 and below
export function isIE() {
	const ua = window.navigator.userAgent;
	return -1 !== ua.indexOf( 'MSIE' ) || -1 !== ua.indexOf( 'Trident/' );
}

/**
 * Returns CSS link HTML
 *
 * @param  {String} url 	The css file path
 * @return {String}         The HTML source or an empty string if `url` is absent.
 */
export function getCSSLinkHtml( url ) {
	return url ? `<link type="text/css" media="all" rel="stylesheet" href="${ url }" />` : '';
}

/**
 * Releases an existing object URL to let the browser know not to keep the reference to the file any longer.
 * For memory management: https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
 *
 * @param  {String} objectUrl A DOMString containing a URL representing an object
 */
export function revokeObjectURL( objectUrl ) {
	URL.revokeObjectURL( objectUrl );
}

/**
 * Returns a WordPress page shell HTML
 *
 * @param  {Object}  content   Object containing `title`, `tagline` and `body` strings
 * @param  {String}  cssUrl    A URL to the theme CSS file
 * @param  {String}  fontUrl   A URL to the font CSS file
 * @param  {Boolean} isRtl     If the current locale is a right-to-left language
 * @param  {String}  langSlug  The slug of the current locale
 * @param  {Boolean} scrolling Whether to allow scrolling on the body
 * @return {String}            The HTML source.
 */
export function getIframeSource(
	content,
	cssUrl,
	fontUrl,
	isRtl = false,
	langSlug = 'en',
	scrolling = true
) {
	const source = `
		<html lang="${ langSlug }" dir="${ isRtl ? 'rtl' : 'ltr' }">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<link rel="dns-prefetch" href="//s0.wp.com">
			<link rel="dns-prefetch" href="//fonts.googleapis.com">
			<title>${ content.title } – ${ content.tagline }</title>
			<link type="text/css" media="all" rel="stylesheet" href="https://s0.wp.com/wp-content/plugins/gutenberg-core/v5.9.0/build/block-library/style.css" />
			${ getCSSLinkHtml( cssUrl ) }
			${ getCSSLinkHtml( fontUrl ) }
			<style type="text/css">
				body {
					padding-bottom: 25px;
				}

				.no-scrolling {
					overflow: hidden;
				}

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

				@media only screen and (min-width: 768px) {
					/*
						Some of the themes (business sophisticated) use js to dynamically set the height of the banner
						Let's set a fixed max-height.
					*/
					.entry .entry-content .wp-block-cover-image,
					.entry .entry-content .wp-block-cover {
						min-height: 500px !important;
					}
				}

				/*
					Fixes a weird bug in Safari, despite the markup and CSS
					being the same, the gallery images for the default Professional site (m4)
					are stretched. Issue #33758.
					This should be a temp fix until we can either locate the problem or
					we update the theme CSS.
				*/
				.wp-block-gallery .blocks-gallery-image figure,
				.wp-block-gallery .blocks-gallery-item figure {
				   flex-direction: column;
				   height: auto;
				}

				.is-loading .wp-block-cover,
				.is-loading img {
					animation: loading-animation 1.5s infinite;
					background-color: rgba( 0, 0, 0, 0.1 ) !important;
				}

				@keyframes loading-animation {
					0%   { background-color: rgba( 0, 0, 0, 0.7 ); }
					50%  { background-color: rgba( 0, 0, 0, 1 ); }
					100% { background-color: rgba( 0, 0, 0, 0.7 ); }
				}
			</style>
		</head>
		<body class="home page-template-default page logged-in is-loading ${
			scrolling ? '' : 'no-scrolling'
		}">
			<div id="page" class="site">
				<header id="masthead" class="site-header">
					<div class="site-branding-container">
						<div class="site-branding">
							<p class="site-title signup-site-preview__title">${ content.title }</p>
						</div>
					</div>
				</header>
				<div id="content" class="site-content">
					<section id="primary" class="content-area">
						<main id="main" class="site-main">
							<article class="page type-page status-publish hentry entry">
								<div class="entry-content">
									${ content.body }
								</div>
							</article>
						</div>
					</section>
				</div>
			</div>
		</body>
	</html>`;

	if ( isIE() ) {
		return source;
	}

	return URL.createObjectURL( new Blob( [ source ], { type: 'text/html' } ) );
}
