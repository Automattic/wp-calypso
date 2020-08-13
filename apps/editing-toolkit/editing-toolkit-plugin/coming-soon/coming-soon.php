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

	$should_show = true;

	// TODO: Is this dealing with the case where they're logged in but aren't a member of the site?
	if ( is_user_logged_in() ) {
		$should_show = false;
	}

	return apply_filters( 'a8c_show_coming_soon_page', $should_show );
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

	$id = (int) get_option( 'wpcom_coming_soon_page', 0 );

	if ( empty( $id ) ) {
		return;
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
