<?php
define( 'NEWSPACK_BLOCKS__BLOCKS_DIRECTORY', '../dist/' );
define( 'NEWSPACK_BLOCKS__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEWSPACK_BLOCKS__VERSION', '1.0.0-alpha.17' );

function homepage_posts_view_assets( $style_path, $type, $is_rtl ) {
	if ( 'homepage-articles' !== $type ) {
		return $style_path;
	}

	if ( $is_rtl ) {
		return './dist/editor.rtl.css';
	}

	return './dist/editor.css';
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
