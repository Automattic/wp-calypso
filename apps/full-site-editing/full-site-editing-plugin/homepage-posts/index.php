<?php
/**
 * Hompage posts file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

define( 'NEWSPACK_BLOCKS__BLOCKS_DIRECTORY', 'dist/' );
define( 'NEWSPACK_BLOCKS__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEWSPACK_BLOCKS__VERSION', '1.0.0-alpha.18' );

/**
 * Filters block name.
 *
 * @param string $name Block name.
 * @return string
 */
function homepage_posts_block_name( $name ) {
	if ( 'newspack-blocks/homepage-articles' === $name ) {
		return 'a8c/homepage-posts';
	}
	return $name;
}
add_filter( 'newspack_blocks_block_name', __NAMESPACE__ . '\homepage_posts_block_name' );

/**
 * Filters block arguments for `register_block_type()`.
 *
 * @param array  $args Arguments to `register_block_type()`.
 * @param string $name Block name.
 * @return array
 */
function homepage_posts_block_args( $args, $name ) {
	if ( 'homepage-articles' !== $name ) {
		return $args;
	}

	// Editor script.
	$script_data = require NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.asset.php';
	wp_register_script(
		'homepage-posts-editor',
		plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.js', __FILE__ ),
		$script_data['dependencies'],
		$script_data['version'],
		true
	);

	// Editor style.
	$editor_style = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.css', __FILE__ );
	wp_register_style( 'homepage-posts-editor', $editor_style, [], NEWSPACK_BLOCKS__VERSION );

	// View style.
	$editor_style = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'view.css', __FILE__ );
	wp_register_style( 'homepage-posts-view', $editor_style, [], NEWSPACK_BLOCKS__VERSION );

	$args['editor_script'] = 'homepage-posts-editor';
	$args['editor_style']  = 'homepage-posts-editor';
	$args['style']         = 'homepage-posts-view';

	return $args;
}
add_filter( 'newspack_blocks_block_args', __NAMESPACE__ . '\homepage_posts_block_args', 10, 2 );

require_once __DIR__ . '/newspack-homepage-articles/class-newspack-blocks.php';
require_once __DIR__ . '/newspack-homepage-articles/class-newspack-blocks-api.php';

require_once __DIR__ . '/newspack-homepage-articles/blocks/homepage-articles/view.php';
