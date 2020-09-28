<?php
/**
 * Coming Soon
 *
 * @package A8C\FSE\Coming_soon
 */

namespace A8C\FSE\Coming_soon;

/**
 * Load the coming soon page tempalate object
 *
 * @return object
 */
function get_coming_soon_page_template() {
	return json_decode(
		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		file_get_contents( __DIR__ . '/coming-soon-page-template.json' ),
		false
	);
}

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
 * This filter adds the coming soon page to the list of page templates using the `vertical_templates` hook
 *
 * @param array $templates The array of all available page templates.
 *
 * @return array The updated $templates array
 */
function add_public_coming_soon_page_template( $templates ) : array {
	$templates[] = get_coming_soon_page_template();
	return $templates;
}
add_filter( 'vertical_templates', __NAMESPACE__ . '\add_public_coming_soon_page_template' );

/**
 * Adds an editable coming soon page to a new site.
 */
function add_coming_soon_page_to_new_site() {
	$coming_soon_template = get_coming_soon_page_template();
	wp_insert_post(
		array(
			'post_title'     => $coming_soon_template->post_title,
			'post_content'   => $coming_soon_template->post_content,
			'post_status'    => 'publish',
			'post_type'      => 'page',
			'comment_status' => 'closed',
			'ping_status'    => 'closed',
		)
	);
}
add_action( 'signup_finished', __NAMESPACE__ . '\add_coming_soon_page_to_new_site' );

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

	$should_show_fallback = false;

	$id = (int) get_option( 'wpcom_public_coming_soon_page_id', 0 );
	if ( empty( $id ) ) {
		$should_show_fallback = true;
	}

	$custom_coming_soon_page = get_post( $id );
	if ( ! $custom_coming_soon_page ) {
		$should_show_fallback = true;
	}

	if ( $should_show_fallback ) {
		render_fallback_coming_soon_page();
		die();
	}

	?>
	<!doctype html>
	<html <?php language_attributes(); ?>>
		<head>
			<meta charset="<?php bloginfo( 'charset' ); ?>" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<?php wp_head(); ?>
		</head>
		<body>
			<?php
				// Replicates the core `the_content()` function except using the custom
				// coming soon page instead of the current page.
				$content = get_the_content( null, false, $custom_coming_soon_page );
				$content = apply_filters( 'the_content', $content );

				// Perform the same escaping done by the `the_content()` function.
				// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				echo str_replace( ']]>', ']]&gt;', $content );
			?>
			<?php wp_footer(); ?>
		</body>
	</html>
	<?php

	die();
}
add_action( 'template_redirect', __NAMESPACE__ . '\coming_soon_page' );
