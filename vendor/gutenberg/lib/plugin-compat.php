<?php
/**
 * This file includes a set of temporary fixes for known compatibility
 * issues with third-party plugins. These fixes likely should not to be
 * included with core merge.
 *
 * @package gutenberg
 * @since 1.3.0
 *
 * The goal is to provide a fix so
 * 1. users of the plugin can continue to use and test Gutenberg,
 * 2. provide a reference for developers of the plugin to work with, and
 * 3. provide reference for other plugin developers on how they might work
 *    with Gutenberg.
 */

/**
 * WPCOM markdown support causes issues when saving a Gutenberg post by
 * stripping out the <p> tags. This adds a filter prior to saving the post via
 * REST API to disable markdown support. Disables markdown support provided by
 * plugins Jetpack, JP-Markdown, and WP Editor.MD
 *
 * @since 1.3.0
 *
 * @param  array $post      Post object which contains content to check for block.
 * @return array $post      Post object.
 */
function gutenberg_remove_wpcom_markdown_support( $post ) {
	if ( class_exists( 'WPCom_Markdown' ) && gutenberg_content_has_blocks( $post['post_content'] ) ) {
		WPCom_Markdown::get_instance()->unload_markdown_for_posts();
	}
	return $post;
}
add_filter( 'wp_insert_post_data', 'gutenberg_remove_wpcom_markdown_support', 9 );
