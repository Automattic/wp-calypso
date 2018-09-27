<?php
/**
 * Plugin Name: Atavist Blocks
 * Description: Prototype blocks for Atavist -> WP migration.
 * Author: rabberson
 * Version: 1.0.0
 * License: GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package CGB
 */
// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
function atavist_block_assets() {
	// Styles.
	wp_enqueue_style(
		'atavist_view-css',
		plugins_url( 'build/view.css', __FILE__ ),
		array( 'wp-blocks' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/view.css' )
	);
	if ( ! is_admin() ) {
		wp_enqueue_script(
			'atavist_view-js',
			plugins_url( 'build/view.js', __FILE__ ),
			array( 'wp-blocks', 'jquery' ),
			filemtime( plugin_dir_path( __FILE__ ) . 'build/view.js' )
		);
	}
}
add_action( 'enqueue_block_assets', 'atavist_block_assets' );

function atavist_editor_assets() {
	wp_enqueue_script(
		'atavist_editor-js',
		plugins_url( 'build/editor.js', __FILE__ ),
		array( 'wp-blocks', 'wp-i18n', 'wp-element' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/editor.js' )
	);
	wp_enqueue_style(
		'atavist_editor-css', // Handle.
		plugins_url( 'build/editor.css', __FILE__ ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( __FILE__ ) . 'build/editor.css' )
	);
}
add_action( 'enqueue_block_editor_assets', 'atavist_editor_assets' );
