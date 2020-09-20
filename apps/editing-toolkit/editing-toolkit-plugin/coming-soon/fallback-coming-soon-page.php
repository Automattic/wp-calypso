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
			.body {
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
			.inner {
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
			.main,
			.marketing {
				flex: 0 0 100%;
			}
			.name {
				color: #fff;
				font-size: 19px;
				line-height: 1.3;
				margin-bottom: 8px;
				padding: 0;
				text-align: left;
			}
			.description {
				color: #fff;
				font-size: 40px;
				line-height: 1.15;
				padding: 0;
				text-align: left;
			}
			.description,
			.copy {
				font-family: Georgia, "Times New Roman", Times, serif;
			}
			.marketing {
				padding-bottom: 8px;
			}
			.marketing-copy {
				display: flex;
				align-items: center;
			}
			.logo {
				height: 32px;
				margin-right: 16px;
				width: 32px;
			}
			.copy {
				line-height: 1.4;
				margin: 0;
			}
			.marketing-buttons .button {
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
			.marketing-buttons .button-secondary,
			.marketing-buttons .button-secondary:hover,
			.marketing-buttons .button-secondary:focus {
				background: transparent;
				color: #fff;
			}
			.marketing-buttons .button:hover,
			.marketing-buttons .button:focus {
				opacity: .85;
			}
			@media screen and ( min-width: 660px ) {
				.description,
				.copy {
					font-family: Recoleta, Georgia, "Times New Roman", Times, serif;
				}
				.name {
					font-size: 23px;
				}
				.description {
					font-size: 69px;
				}
				.marketing {
					align-items: center;
					display: flex;
					justify-content: space-between;
					padding-bottom: 24px;
				}
				.marketing-copy {
					margin-right: 16px;
				}
				.marketing-buttons {
					display: flex;
				}
				.marketing-buttons p {
					margin: 0;
				}
				.marketing-buttons p:nth-child(2) {
					margin-left: 8px;
				}
				.marketing-buttons .button {
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
				.name {
					font-size: 28px;
					margin-bottom: 16px;
				}
				.description {
					font-size: 99px;
				}
				.copy {
					font-size: 19px;
				}
			}
			@media screen and ( min-width: 1040px ) {
				.body {
					-ms-grid-columns: (1fr)[12];
					grid-template-columns: repeat(12, 1fr);
				}
				.inner {
					-ms-grid-column: 2;
					grid-column-start: 2;
					-ms-grid-column-span: 10;
					grid-column-end: span 10;
				}
				.marketing {
					padding-bottom: 32px;
				}
			}
		</style>
	</head>
	<body class="body">
		<div class="inner">
			<div class="main">
				<div class="name"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></div>
				<div class="description"><?php esc_html_e( 'Coming Soon', 'full-site-editing' ); ?></div>
				<p>(v2 — remove this line when finished testing)</p>
			</div>
			<div class="marketing">
				<?php if ( ! is_user_logged_in() ) : ?>
					<div class="marketing-copy">
						<img src="/wp-content/themes/a8c/domain-landing-page/wpcom-wmark-white.svg" alt="WordPress.com" class="logo" />
						<p class="copy"><?php echo esc_html( fix_widows( __( 'Build a website. Sell your stuff. Write a blog. And so much more.', 'full-site-editing' ), array( 'mobile_enable' => true ) ) ); ?></p>
					</div>
					<div class="marketing-buttons">
						<p>
							<a class="button button-secondary" href="<?php echo esc_url( $login_url ); ?>"><?php esc_html_e( 'Log in', 'full-site-editing' ); ?></a>
						</p>
						<p>
							<a class="button button-primary " href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/?ref=coming_soon' ) ); ?>"><?php esc_html_e( 'Start your website', 'full-site-editing' ); ?></a>
						</p>
					</div>
				<?php endif; ?>
			</div>
		</div>
		<?php wp_footer(); ?>
	</body>
</html>
