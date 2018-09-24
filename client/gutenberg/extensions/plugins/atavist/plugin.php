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
		array( 'wp-blocks' )
		// filemtime( plugin_dir_path( __DIR__ ) . '/view.css' )
	);

	if ( ! is_admin() ) {
		wp_enqueue_script(
			'atavist_view-js',
			plugins_url( 'build/view.js', __FILE__ ),
			array( 'wp-blocks', 'jquery' )
			// filemtime( plugin_dir_path( __DIR__ ) . '/view.js' )
		);
	}
} // End function atavist_block_prototypes_cgb_block_assets().

// Hook: Frontend assets.
add_action( 'enqueue_block_assets', 'atavist_block_assets' );

function atavist_editor_assets() {
	wp_enqueue_script(
		'atavist_editor-js',
		plugins_url( 'build/editor.js', __FILE__ ),
		array( 'wp-blocks', 'wp-i18n', 'wp-element' )
		// filemtime( plugin_dir_path( __DIR__ ) . './editor.js' )
	);
	wp_enqueue_style(
		'atavist_editor-css', // Handle.
		plugins_url( 'build/editor.css', __FILE__ ), // Block editor CSS.
		array( 'wp-edit-blocks' )
		// filemtime( plugin_dir_path( __DIR__ ) . '/editor.css' )
	);

} // End function atavist_block_prototypes_cgb_editor_assets().

// Hook: Editor assets.
add_action( 'enqueue_block_editor_assets', 'atavist_editor_assets' );

/**
 * Register Atavist post type.
 *
 *
 * @since 1.0.0
 */
function atavist_atavist_post_type() {
    $args = array(
        'public' => true,
        'label'  => 'Atavist',
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'author', 'thumbnail', 'excerpt'),
        'template' => array(
            array( 'atavist/navigation-none', array(
                'align' => 'center',
            ) )
        ),
        'template_lock' => 'all'
    );
    register_post_type( 'atavist', $args );
}
add_action( 'init', 'atavist_atavist_post_type' );
