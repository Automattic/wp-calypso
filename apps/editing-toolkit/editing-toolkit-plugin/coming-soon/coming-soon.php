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

	$should_show = ( (int) get_option( 'wpcom_coming_soon' ) === 1 );

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
 * Decides whether to redirect to the site's coming soon page and performs
 * the redirect.
 */
function coming_soon_page() {
	global $post;

	if ( ! show_coming_soon_page() ) {
		return;
	}

	$id = (int) get_option( 'wpcom_coming_soon_page_id', 0 );

	if ( empty( $id ) ) {
		render_fallback_coming_soon_page();
		die();
	}

	if ( $post->ID === $id ) {
		// We're already viewing the coming soon page, don't redirect.
		return;
	}

	$coming_soon_page_url = get_page_link( $id );

	if ( wp_safe_redirect( $coming_soon_page_url ) ) {
		exit;
	}
}
add_action( 'template_redirect', __NAMESPACE__ . '\coming_soon_page' );
