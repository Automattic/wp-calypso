<?php
/**
 * Customize the look and feel of the Site Editor on WP.com.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Enqueue block editor assets.
 */
function wpcom_site_editor_script() {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/wpcom-site-editor.asset.php';
	$script_dependencies = $asset_file['dependencies'];
	$version             = $asset_file['version'];

	wp_enqueue_script(
		'wpcom-site-editor-script',
		plugins_url( 'dist/wpcom-site-editor.js', __FILE__ ),
		is_array( $script_dependencies ) ? $script_dependencies : array(),
		$version,
		true
	);

	global $post;
	if ( isset( $post ) && is_post_with_write_intent( $post ) ) {
		wp_localize_script(
			'wpcom-site-editor-script',
			'wpcomSiteEditorParagraphPlaceholder',
			fixme__( "Start writing or type '/' to insert a block", '', 'full-site-editing' )
		);
	}
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\wpcom_site_editor_script' );

/**
 * Check is it a post with “write” intent
 *
 * @param WP_Post $post Current post object.
 */
function is_post_with_write_intent( $post ) {
	return 'post' === $post->post_type && 'write' === get_option( 'site_intent', '' );
}

/**
 * Replace the title placeholder if it's the post with “write” intent
 *
 * @param string  $text Text to shown.
 * @param WP_Post $post Current post object.
 */
function enter_title_here( $text, $post ) {
	if ( is_post_with_write_intent( $post ) ) {
		return fixme__( 'Add a post title', $text, 'full-site-editing' );
	}

	return $text;
}
add_filter( 'enter_title_here', __NAMESPACE__ . '\enter_title_here', 0, 2 );

/**
 * Replace the body placeholder if it's the post with “write” intent
 *
 * @param string  $text Text to shown.
 * @param WP_Post $post Current post object.
 */
function write_your_story( $text, $post ) {
	if ( is_post_with_write_intent( $post ) ) {
		return fixme__( "Start writing or type '/' to insert a block", $text, 'full-site-editing' );
	}

	return $text;
}
add_filter( 'write_your_story', __NAMESPACE__ . '\write_your_story', 0, 2 );
