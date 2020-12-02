<?php
/**
 * Coming Soon
 *
 * @package A8C\FSE\Coming_soon
 */

namespace A8C\FSE\Coming_soon;

/**
 * Determines whether the coming soon page should be shown.
 *
 * @return boolean
 */
function should_show_coming_soon_page() {
	if ( ! is_singular() && ! is_archive() && ! is_search() && ! is_front_page() && ! is_home() && ! is_404() ) {
		return false;
	}

	$should_show = ( (int) get_option( 'wpcom_public_coming_soon' ) === 1 );

	// Everyone from Administrator to Subscriber will be able to see the site.
	// See https://wordpress.org/support/article/roles-and-capabilities/ for all roles and capabilities.
	// We can update to `edit_post` to be stricter, or open it up as an editable feature.
	if ( is_user_logged_in() && current_user_can( 'read' ) ) {
		$should_show = false;
	}

	// Allow folks to hook into this method to set their own rules.
	// We'll use to on WordPress.com to check further user privileges.
	return apply_filters( 'a8c_show_coming_soon_page', $should_show );
}

/**
 * Renders a fallback coming soon page
 */
function render_fallback_coming_soon_page() {
	if ( ! defined( 'GRAVATAR_HOVERCARDS__DISABLE' ) ) {
		define( 'GRAVATAR_HOVERCARDS__DISABLE', true );
	}

	// Disable WP scripts, likes, social og meta, cookie banner.
	remove_action( 'wp_enqueue_scripts', 'wpcom_actionbar_enqueue_scripts', 101 );
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'wp_head', 'header_js', 5 );
	remove_action( 'wp_head', 'global_css', 5 );
	remove_action( 'wp_footer', 'wpcom_subs_js' );
	remove_action( 'wp_footer', 'stats_footer', 101 );
	add_filter( 'jetpack_disable_eu_cookie_law_widget', '__return_true', 1 );
	add_filter( 'jetpack_enable_opengraph', '__return_false', 1 );
	add_filter( 'wpcom_disable_logged_out_follow', '__return_true', 10, 1 ); // Disable follow actionbar.
	add_filter( 'wpl_is_enabled_sitewide', '__return_false', 10, 1 ); // Disable likes.
	add_filter( 'jetpack_implode_frontend_css', '__return_false', 99 ); // Jetpack "implodes" all registered CSS files into one file.

	wp_enqueue_style( 'recoleta-font', '//s1.wp.com/i/fonts/recoleta/css/400.min.css', array(), PLUGIN_VERSION );

	include __DIR__ . '/fallback-coming-soon-page.php';
}

/**
 * This filter makes sure it's possible to fetch `wpcom_public_coming_soon` option via public-api.wordpress.com.
 *
 * @param object $options array Retrieved site options, ready to be returned as API respomnse.
 *
 * @return array current value of `wpcom_public_coming_soon`
 */
function add_public_coming_soon_to_settings_endpoint_get( $options ) {
	$options['wpcom_public_coming_soon'] = (int) get_option( 'wpcom_public_coming_soon' );

	return $options;
}
add_filter( 'site_settings_endpoint_get', __NAMESPACE__ . '\add_public_coming_soon_to_settings_endpoint_get' );

/**
 * This filter makes sure it's possible to change `wpcom_public_coming_soon` option via public-api.wordpress.com.
 *
 * @param object $input Filtered POST input.
 * @param object $unfiltered_input Raw and unfiltered POST input.
 *
 * @return mixed
 */
function add_public_coming_soon_to_settings_endpoint_post( $input, $unfiltered_input ) {
	if ( array_key_exists( 'wpcom_public_coming_soon', $unfiltered_input ) ) {
		$input['wpcom_public_coming_soon'] = (int) $unfiltered_input['wpcom_public_coming_soon'];
	}
	return $input;
}
add_filter( 'rest_api_update_site_settings', __NAMESPACE__ . '\add_public_coming_soon_to_settings_endpoint_post', 10, 2 );

/**
 * Launch the site when the privacy mode changes from public-not-indexed
 * This can happen due to clicking the launch button from the banner
 * Or due to manually updating the setting in wp-admin or calypso settings page.
 *
 * @param string $old_value the old value of blog_public.
 * @param string $value     the new value of blog_public.
 */
function disable_coming_soon_on_privacy_change( $old_value, $value ) {
	if ( 0 !== (int) $old_value || 0 === (int) $value ) {
		// Do nothing if not moving from public-not-indexed.
		return;
	}
	update_option( 'wpcom_public_coming_soon', 0 );
}
add_action( 'update_option_blog_public', __NAMESPACE__ . '\disable_coming_soon_on_privacy_change', 10, 2 );

// phpcs:disable Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed
/**
 * Adds the `wpcom_public_coming_soon` option to new sites  if requested by the client.
 *
 * @param int    $blog_id    Blog ID.
 * @param int    $user_id    User ID.
 * @param string $domain     Site domain.
 * @param string $path       Site path.
 * @param int    $network_id Network ID. Only relevant on multi-network installations.
 * @param array  $meta       Meta data. Used to set initial site options.
 */
function add_option_to_new_site( $blog_id, $user_id, $domain, $path, $network_id, $meta ) {
	if ( 0 === $meta['public'] && 1 === (int) $meta['options']['wpcom_public_coming_soon'] ) {
		add_blog_option( $blog_id, 'wpcom_public_coming_soon', 1 );
	}
}
// phpcs:enable Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed
add_action( 'wpmu_new_blog', __NAMESPACE__ . '\add_option_to_new_site', 10, 6 );

/**
 * Decides whether to redirect to the site's coming soon page and performs
 * the redirect.
 */
function coming_soon_page() {
	if ( ! should_show_coming_soon_page() ) {
		return;
	}

	render_fallback_coming_soon_page();
	die();
}
add_action( 'template_redirect', __NAMESPACE__ . '\coming_soon_page' );
