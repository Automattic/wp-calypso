<?php
/**
 * Customize paragraph block on WP.com.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Enqueue block editor assets.
 */
function paragraph_block_script() {
	$asset_file          = include plugin_dir_path( __FILE__ ) . 'dist/paragraph-block.asset.php';
	$script_dependencies = $asset_file['dependencies'];
	$version             = $asset_file['version'];

	wp_enqueue_script(
		'paragraph-block-script',
		plugins_url( 'dist/paragraph-block.min.js', __FILE__ ),
		is_array( $script_dependencies ) ? $script_dependencies : array(),
		$version,
		true
	);

	global $post;
	if ( isset( $post ) && is_post_with_write_intent( $post ) ) {
		wp_localize_script(
			'paragraph-block-script',
			'wpcomParagraphBlockPlaceholder',
			translation_with_fallback(
				"Start writing or type '/' to insert a block",
				__( "Start writing or type '/' to insert a block", 'full-site-editing' ),
				''
			)
		);
	}
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\paragraph_block_script' );

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
		return translation_with_fallback(
			'Add a post title',
			__( 'Add a post title', 'full-site-editing' ),
			$text
		);
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
		return translation_with_fallback(
			"Start writing or type '/' to insert a block",
			__( "Start writing or type '/' to insert a block", 'full-site-editing' ),
			$text
		);
	}

	return $text;
}
add_filter( 'write_your_story', __NAMESPACE__ . '\write_your_story', 0, 2 );

/**
 * Translation with fallback message if it's not ready because fixme__ function doesn't work on atomic site
 *
 * @param string $new_text          New text without translation.
 * @param string $new_translation   New text with translation.
 * @param string $old_translation   Old text with translation.
 */
function translation_with_fallback( $new_text, $new_translation, $old_translation ) {
	$is_english = 'en' === substr( get_locale(), 0, 2 );

	if ( $is_english || $new_translation !== $new_text ) {
		return $new_translation;
	}

	return $old_translation;
}
