<?php
/**
 * Coming Soon fallback page.
 *
 * This page is used when the site is set to Coming Soon mode, but no
 * Coming Soon page id has been set.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

if ( ! function_exists( 'fix_widows' ) ) {
	/**
	 * Fix_widows stub
	 *
	 * @param  string $string String.
	 * @param  array  $args   Args.
	 * @return string String.
	 */
	function fix_widows( $string, $args = array() ) {
		return $string;
	}
}

if ( ! function_exists( 'localized_wpcom_url' ) ) {
	/**
	 * Localized_wpcom_url stub
	 *
	 * @param  string $url Url.
	 * @return string Url.
	 */
	function localized_wpcom_url( $url ) {
		return $url;
	}
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
	<head>
		<title><?php echo esc_html( get_bloginfo( 'name' ) ); ?></title>
		<meta charset="<?php esc_attr( bloginfo( 'charset' ) ); ?>" />
		<meta name="description" content="<?php echo esc_attr( get_bloginfo( 'description' ) ); ?>" />
		<meta name="viewport" content="width=device-width" />
		<?php wp_head(); ?>
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
						<p><a class="button button-secondary" href="<?php echo esc_url( $login_url ); ?>"><?php esc_html_e( 'Log in', 'full-site-editing' ); ?></a></p>
						<p><a class="button button-primary " href="<?php echo esc_url( localized_wpcom_url( 'https://wordpress.com/?ref=coming_soon' ) ); ?>"><?php esc_html_e( 'Start your website', 'full-site-editing' ); ?></a></p>
					</div>
				<?php endif; ?>
			</div>
		</div>
		<?php wp_footer(); ?>
	</body>
</html>
