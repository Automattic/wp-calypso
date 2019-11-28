<?php
define( 'NEWSPACK_BLOCKS__BLOCKS_DIRECTORY', 'dist/' );
define( 'NEWSPACK_BLOCKS__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEWSPACK_BLOCKS__VERSION', '1.0.0-alpha.17' );

function homepage_posts_view_assets( $style_path, $type, $is_rtl ) {
	if ( 'homepage-articles' !== $type ) {
		return $style_path;
	}

	if ( $is_rtl ) {
		return plugins_url( 'dist/view.rtl.css', __FILE__ );
	}

	return plugins_url( 'dist/view.css', __FILE__ );
}
add_filter( 'newspack_blocks_enqueue_view_assets', 'homepage_posts_view_assets', 10, 3 );

function homepage_posts_block_name( $name ) {
	if ( 'homepage-articles' === $name ) {
		return 'a8c/homepage-posts';
	}
	return $name;
}
add_filter( 'newspack_blocks_block_name', 'homepage_posts_block_name' );

require_once __DIR__ . '/newspack-homepage-articles/class-newspack-blocks.php';
require_once __DIR__ . '/newspack-homepage-articles/class-newspack-blocks-api.php';

require_once __DIR__ . '/newspack-homepage-articles/blocks/homepage-articles/view.php';


function temp_enqueue_editor() {
	$script_data = require 'dist/editor.asset.php';

	// $script_data['script_path'] = plugins_url( $script_path, __FILE__ );
	// return $script_data;
	wp_enqueue_script(
		'newspack-blocks-editor',
		plugins_url( 'dist/editor.js', __FILE__ ),
		$script_data['dependencies'],
		$script_data['version'],
		true
	);
	$editor_style = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.css', __FILE__ );

	wp_enqueue_style(
		'newspack-blocks-editor',
		$editor_style,
		array(),
		NEWSPACK_BLOCKS__VERSION
	);
}

function temp_enqueue_view() {
	$editor_style = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'view.css', __FILE__ );
	wp_enqueue_style(
		'newspack-blocks-view',
		$editor_style,
		array(),
		NEWSPACK_BLOCKS__VERSION
	);
}

add_action( 'enqueue_block_editor_assets', 'temp_enqueue_editor' );
add_action( 'wp_enqueue_scripts', 'temp_enqueue_view' );

add_action( 'wp_enqueue_scripts', array( 'Newspack_Blocks', 'enqueue_block_styles_assets' ) );

