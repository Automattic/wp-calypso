<?php
/**
 * Hompage posts file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

define( 'NEWSPACK_BLOCKS__BLOCKS_DIRECTORY', 'dist/' );
define( 'NEWSPACK_BLOCKS__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEWSPACK_BLOCKS__VERSION', '1.0.0-alpha.17' );

/**
 * Config file
 */
$config = json_decode(
	file_get_contents( __DIR__ . '/config.json' ), // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	true
);


/**
 * Filters block name.
 *
 * @param string $name Block name.
 * @return string
 */
$homepage_posts_block_name = function ( $name ) use ( $config ) {
	if ( $config['nha_block_name'] === $name ) {
		return "a8c/${config['plugin_name']}";
	}
	return $name;
};
//add_filter( 'newspack_blocks_block_name', $homepage_posts_block_name );
add_filter( 'newspack_blocks_block_name', $homepage_posts_block_name );


/**
 * Filters block arguments for `register_block_type()`.
 *
 * @param array  $args Arguments to `register_block_type()`.
 * @param string $name Block name.
 * @return array
 */
$homepage_posts_block_args = function ( $args, $name ) use( $config ){
	if ( $config['nha_block_name'] !== $name ) {
		return $args;
	}

	// Editor script.
	$script_data = require NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.asset.php';
	wp_register_script(
		"${config['plugin_name']}-editor",
		plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.js', __FILE__ ),
		$script_data['dependencies'],
		$script_data['version'],
		true
	);

	// Editor style.
	$editor_style = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.css', __FILE__ );
	wp_register_style( "${config['plugin_name']}-editor", $editor_style, [], NEWSPACK_BLOCKS__VERSION );

	// View style.
	$editor_style = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'view.css', __FILE__ );
	wp_register_style( "${config['plugin_name']}-view", $editor_style, [], NEWSPACK_BLOCKS__VERSION );

	$args['editor_script'] = "${config['plugin_name']}-editor";
	$args['editor_style']  = "${config['plugin_name']}-editor";
	$args['style']         = "${config['plugin_name']}-view";

	return $args;
};
add_filter( 'newspack_blocks_block_args', $homepage_posts_block_args, 10, 2 );

require_once __DIR__ . $config['nha_folder'] . '/class-newspack-blocks.php';
require_once __DIR__ . $config['nha_folder'] . '/class-newspack-blocks-api.php';

require_once __DIR__ . $config['nha_folder'] . '/blocks/homepage-articles/view.php';
