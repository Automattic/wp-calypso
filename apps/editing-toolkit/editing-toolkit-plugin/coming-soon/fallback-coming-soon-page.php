<?php
/**
 * Coming Soon fallback page.
 *
 * This page is used when the site is set to Coming Soon mode, but no
 * Coming Soon page id has been set.
 *
 * @package A8C\FSE\Coming_soon
 */

namespace A8C\FSE\Coming_soon;

/**
 * Returns the current locale
 *
 * @return string Language slug
 */
function get_current_locale() {
	$language = function_exists( 'get_blog_lang_code' ) ? get_blog_lang_code() : get_locale();
	return \A8C\FSE\Common\get_iso_639_locale( $language );
}

/**
 * Returns request URL for self-hosted and/or Atomic sites (non-WordPress.com sites)
 *
 * @return string The redirect URL
 */
function original_request_url() {
	if ( empty( $_SERVER['SERVER_NAME'] ) || empty( $_SERVER['REQUEST_URI'] ) ) {
		return get_marketing_home_url();
	}

	$origin = ( is_ssl() ? 'https://' : 'http://' ) . sanitize_text_field( wp_unslash( $_SERVER['SERVER_NAME'] ) );

	if ( ! empty( $_SERVER['SERVER_PORT'] ) && ! in_array( $_SERVER['SERVER_PORT'], array( 80, 443 ), true ) ) {
		$origin .= ':' . sanitize_text_field( wp_unslash( $_SERVER['SERVER_PORT'] ) );
	}

	return $origin . strtok( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), '?' );
}

/**
 * Returns a redirect URL for post-login flow in WordPress.com
 *
 * @return string The redirect URL
 */
function get_wpcom_redirect_to() {
	// Redirect to the current URL.
	// If, for any reason, the superglobals aren't available, set a default redirect.
	if ( empty( $_SERVER['HTTP_HOST'] ) || empty( $_SERVER['REQUEST_URI'] ) ) {
		return get_marketing_home_url();
	}

	return rawurlencode( 'https://' . sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) . sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) );
}

/**
 * Returns a localized login URL with redirect query param
 *
 * @return string The login URL
 */
function get_login_url() {
	// If we're on WPCOM use a WordPress.com login URL.
	if ( has_filter( 'wpcom_public_coming_soon_localize_url' ) ) {
		return apply_filters( 'wpcom_public_coming_soon_localize_url', '//wordpress.com/log-in?redirect_to=' . get_wpcom_redirect_to() );
	}
	return site_url() . '/wp-login.php?redirect_to=' . set_url_scheme( original_request_url() );
}

/**
 * Returns a localized onboarding URL with redirect query param
 *
 * @return string The URL
 */
function get_onboarding_url() {
	if ( has_filter( 'wpcom_public_coming_soon_localize_url' ) ) {
		return apply_filters( 'wpcom_public_coming_soon_localize_url', 'https://wordpress.com/?ref=coming_soon' );
	}

	$locale           = get_current_locale();
	$locale_subdomain = 'en' === $locale ? '' : $locale . '.';

	return 'https://' . $locale_subdomain . 'wordpress.com/?ref=coming_soon';
}

nocache_headers();

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
	<head>
		<title><?php echo esc_html( get_bloginfo( 'name' ) ); ?></title>
		<meta charset="<?php esc_attr( bloginfo( 'charset' ) ); ?>" />
		<meta name="description" content="<?php echo esc_attr( get_bloginfo( 'description' ) ); ?>" />
		<meta name="viewport" content="width=device-width" />
		<?php wp_head(); ?>
		<style type="text/css">
			html {
				/* No admin bar nor marketing bar on this page */
				margin-top: 0 !important;
			}
			.wpcom-coming-soon-body {
				background: #117ac9;
				color: #fff;
				display: grid;
				font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu", "Cantarell", "Helvetica Neue", sans-serif;
				grid-gap: 24px;
				-ms-grid-columns: (1fr)[1];
				grid-template-columns: repeat(1, 1fr);
				padding-right: 24px;
				padding-left: 24px;
			}
			.wpcom-coming-soon-inner {
				align-items: flex-end;
				display: flex;
				flex-wrap: wrap;
				-ms-grid-column: 1;
				grid-column-start: 1;
				-ms-grid-column-span: 1;
				grid-column-end: span 1;
				height: 100vh;
				justify-content: space-between;
			}
			.wpcom-coming-soon-main,
			.wpcom-coming-soon-marketing {
				flex: 0 0 100%;
			}
			.wpcom-coming-soon-name {
				color: #fff;
				font-size: 19px;
				line-height: 1.3;
				margin-bottom: 8px;
				padding: 0;
				text-align: left;
			}
			.wpcom-coming-soon-description {
				color: #fff;
				font-size: 40px;
				line-height: 1.15;
				padding: 0;
				text-align: left;
			}
			.wpcom-coming-soon-description,
			.wpcom-coming-soon-marketing-copy-text {
				font-family: Georgia, "Times New Roman", Times, serif;
			}
			.wpcom-coming-soon-marketing {
				padding-bottom: 8px;
			}
			.wpcom-coming-soon-marketing-copy {
				display: flex;
				align-items: center;
				margin-bottom: 20px;
			}
			.wpcom-coming-soon-wplogo {
				margin-right: 16px;
				margin-bottom: 0;
			}
			.wpcom-coming-soon-marketing-copy-text {
				line-height: 1.4;
				margin: 0;
			}
			.wpcom-coming-soon-marketing-buttons .button {
				background: #fff;
				border-radius: 2px;
				border: 1px solid #fff;
				box-sizing: border-box;
				color: #117ac9;
				display: block;
				font-size: 16px;
				font-weight: 700;
				line-height: 21px;
				padding: 13px;
				text-align: center;
				text-overflow: ellipsis;
				text-decoration: none;
				transition: opacity .15s ease-out;
				white-space: nowrap;
				width: 100%;
			}
			.wpcom-coming-soon-marketing-buttons .button-secondary,
			.wpcom-coming-soon-marketing-buttons .button-secondary:hover,
			.wpcom-coming-soon-marketing-buttons .button-secondary:focus {
				background: transparent;
				color: #fff;
			}
			.wpcom-coming-soon-marketing-buttons .button:hover,
			.wpcom-coming-soon-marketing-buttons .button:focus {
				opacity: .85;
			}
			@media screen and ( min-width: 660px ) {
				.wpcom-coming-soon-description,
				.wpcom-coming-soon-marketing-copy-text {
					font-family: Recoleta, Georgia, "Times New Roman", Times, serif;
				}
				.wpcom-coming-soon-name {
					font-size: 23px;
				}
				.wpcom-coming-soon-description {
					font-size: 69px;
				}
				.wpcom-coming-soon-marketing {
					align-items: center;
					display: flex;
					justify-content: space-between;
					padding-bottom: 24px;
				}
				.wpcom-coming-soon-marketing-copy {
					margin-right: 16px;
					margin-bottom: 0;
				}
				.wpcom-coming-soon-marketing-buttons {
					display: flex;
				}
				.wpcom-coming-soon-marketing-buttons p {
					margin: 0;
				}
				.wpcom-coming-soon-marketing-buttons p:nth-child(2) {
					margin-left: 8px;
				}
				.wpcom-coming-soon-marketing-buttons .button {
					font-size: 13px;
					padding: 7px 13px;
					min-width: 145px;
				}
			}
			@media screen and ( min-width: 661px ) {
				p, ul, ol {
					font-size: 16px;
					letter-spacing: 0;
				}
			}
			@media screen and ( min-width: 960px ) {
				.wpcom-coming-soon-name {
					font-size: 28px;
					margin-bottom: 16px;
				}
				.wpcom-coming-soon-description {
					font-size: 99px;
				}
				.wpcom-coming-soon-marketing-copy-text {
					font-size: 19px;
				}
			}
			@media screen and ( min-width: 1040px ) {
				.wpcom-coming-soon-body {
					-ms-grid-columns: (1fr)[12];
					grid-template-columns: repeat(12, 1fr);
				}
				.wpcom-coming-soon-inner {
					-ms-grid-column: 2;
					grid-column-start: 2;
					-ms-grid-column-span: 10;
					grid-column-end: span 10;
				}
				.wpcom-coming-soon-marketing {
					padding-bottom: 32px;
				}
			}
		</style>
	</head>
	<body class="wpcom-coming-soon-body">
		<div class="wpcom-coming-soon-inner">
			<div class="wpcom-coming-soon-main">
				<div class="wpcom-coming-soon-name"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></div>
				<div class="wpcom-coming-soon-description"><?php esc_html_e( 'Coming Soon', 'full-site-editing' ); ?></div>
			</div>
			<div class="wpcom-coming-soon-marketing">
				<?php if ( ! is_user_logged_in() ) : ?>
					<div class="wpcom-coming-soon-marketing-copy">
						<div class="wpcom-coming-soon-wplogo">
							<a href="<?php echo esc_url( get_onboarding_url() ); ?>" title="WordPress.com">
								<svg width="40px" height="40px" viewBox="0 0 40 40" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
									<title>WordPress.com</title>
									<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
										<g transform="translate(-701.000000, -950.000000)" fill="#FFFFFF">
											<path d="M730.04024,985.542 L735.53216,969.66248 C736.55848,967.09712 736.89992,965.046 736.89992,963.222 C736.89992,962.56 736.85632,961.94544 736.7788,961.3728 C738.18232,963.93376 738.9812,966.87296 738.9812,969.99976 C738.9812,976.63312 735.38624,982.42536 730.04024,985.542 L730.04024,985.542 Z M723.47808,961.56864 C724.56048,961.51192 725.53592,961.39784 725.53592,961.39784 C726.5048,961.28336 726.39072,959.8592 725.4216,959.91616 C725.4216,959.91616 722.50896,960.14464 720.6288,960.14464 C718.86176,960.14464 715.8928,959.91616 715.8928,959.91616 C714.92328,959.8592 714.80944,961.34048 715.77904,961.39784 C715.77904,961.39784 716.69616,961.51192 717.6648,961.56864 L720.466,969.2444 L716.53008,981.0464 L709.98288,961.56864 C711.06624,961.51192 712.04056,961.39784 712.04056,961.39784 C713.0092,961.28336 712.89464,959.8592 711.92552,959.91616 C711.92552,959.91616 709.01352,960.14464 707.13336,960.14464 C706.79616,960.14464 706.39824,960.13608 705.97552,960.12264 C709.19128,955.24152 714.7176,952.01808 720.99976,952.01808 C725.68112,952.01808 729.94352,953.80776 733.1424,956.7392 C733.06536,956.73408 732.98944,956.72448 732.90984,956.72448 C731.14328,956.72448 729.89008,958.26312 729.89008,959.91616 C729.89008,961.39784 730.74488,962.65128 731.6564,964.13336 C732.34008,965.33096 733.13872,966.86944 733.13872,969.09216 C733.13872,970.63208 732.68224,972.5684 731.77048,974.90568 L729.97656,980.89832 L723.47808,961.56864 Z M720.99976,987.98328 C719.23488,987.98328 717.53104,987.72376 715.92024,987.25072 L721.31592,971.57256 L726.84248,986.71584 C726.8788,986.80384 726.92336,986.88536 726.97136,986.96312 C725.1024,987.62072 723.09392,987.98328 720.99976,987.98328 L720.99976,987.98328 Z M703.01856,969.99976 C703.01856,967.3924 703.57776,964.91736 704.57576,962.68128 L713.1532,986.18272 C707.154,983.2684 703.01856,977.11744 703.01856,969.99976 L703.01856,969.99976 Z M720.99976,950 C709.97208,950 701,958.97184 701,969.99976 C701,981.02856 709.97208,990.00112 720.99976,990.00112 C732.02768,990.00112 741,981.02856 741,969.99976 C741,958.97184 732.02768,950 720.99976,950 L720.99976,950 Z" id="wpcom-wmark"></path>
										</g>
									</g>
								</svg>
							</a>
						</div>
						<p class="wpcom-coming-soon-marketing-copy-text"><?php esc_html_e( 'Build a website. Sell your stuff. Write a blog. And so much more.', 'full-site-editing' ); ?></p>
					</div>
					<div class="wpcom-coming-soon-marketing-buttons">
						<p><a class="button button-secondary" href="<?php echo esc_url( get_login_url() ); ?>"><?php esc_html_e( 'Log in', 'full-site-editing' ); ?></a></p>
						<p><a class="button button-primary " href="<?php echo esc_url( get_onboarding_url() ); ?>"><?php esc_html_e( 'Start your website', 'full-site-editing' ); ?></a></p>
					</div>
				<?php endif; ?>
			</div>
		</div>
		<?php wp_footer(); ?>
		<!-- WordPress.com Editing Toolkit Plugin - Coming Soon -->
	</body>
</html>
