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
function show_coming_soon_page() {
	global $post;

	// Handle the case where we are not rendering a post.
	if ( ! isset( $post ) ) {
		return false;
	}

	$should_show = ( (int) get_option( 'wpcom_public_coming_soon' ) === 1 );

	if ( is_user_logged_in() && current_user_can( 'read' ) ) {
		$should_show = false;
	}

	return apply_filters( 'a8c_show_coming_soon_page', $should_show );
}

/**
 * Renders a fallback coming soon page
 */
function render_fallback_coming_soon_page() {
	remove_action( 'wp_enqueue_scripts', 'wpcom_actionbar_enqueue_scripts', 101 );
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'wp_head', 'header_js', 5 );
	remove_action( 'wp_head', 'global_css', 5 );
	remove_action( 'wp_footer', 'wpcom_subs_js' );
	remove_action( 'wp_footer', 'stats_footer', 101 );
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
 * Adds the `wpcom_public_coming_soon` option to new sites
 */
function add_option_to_new_site( $blog_id, $user_id, $domain, $path, $site_id, $meta ) {
	if ( 0 === $meta['public'] && 1 === (int) $meta['options']['wpcom_public_coming_soon'] ) {
		add_blog_option( $blog_id, 'wpcom_public_coming_soon', 1 );
	} else {
		add_blog_option( $blog_id, 'wpcom_public_coming_soon', 0 );
	}
}
add_action( 'wpmu_new_blog', __NAMESPACE__ . '\add_option_to_new_site', 10, 6 );

/**
 * This action hook sets the coming soon options when a site launches
 *
 * @param int $current_blog_id The blog id of the current site
 */
function update_options_after_wpcom_site_launched( $current_blog_id ) {
	update_option( 'wpcom_public_coming_soon', 0 ); // version 2
	delete_option( 'wpcom_coming_soon' ); // version 1
}
add_action( 'wpcom_site_launched', __NAMESPACE__ . '\update_options_after_wpcom_site_launched', 10, 2 );

/**
 * Decides whether to redirect to the site's coming soon page and performs
 * the redirect.
 */
function coming_soon_page() {
	if ( ! show_coming_soon_page() ) {
		return;
	}

	add_filter( 'wpcom_disable_logged_out_follow', '__return_true', 10, 1 ); // Disable follow actionbar.
	add_filter( 'wpl_is_enabled_sitewide', '__return_false', 10, 1 ); // Disable likes.

	render_fallback_coming_soon_page();
	die();
}
add_action( 'template_redirect', __NAMESPACE__ . '\coming_soon_page' );
