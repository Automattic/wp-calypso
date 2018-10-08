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
			array( 'wp-blocks', 'wp-api-fetch', 'jquery' ),
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
            array( 'atavist/navigation-flag', array(
                'align' => 'full',
            ) )
        ),
        'template_lock' => 'all'
    );
    register_post_type( 'atavist', $args );
}
add_action( 'init', 'atavist_atavist_post_type' );
function atavist_menu_iterator( $items = [], $level = 0 ) {
	$item_IDs = [];
	$items_by_ID = [];
	$subitems = [];
	foreach ( $items as $item ) {
		if ( ! is_array( $item ) ) {
			$item = $item->to_array();
		}
		$ID = $item[ 'ID' ];
		$title = $item[ 'title' ];
		$url = $item[ 'url' ];
		$menu_item_parent = intVal( $item[ 'menu_item_parent' ] );
		if ( $menu_item_parent > 0 ) {
			if ( ! isset( $subitems[ $menu_item_parent ] ) ) {
				$subitems[ $menu_item_parent ] = [];
			}
			$item[ 'menu_item_parent' ] = 0;
			$subitems[ $menu_item_parent ][] = $item;
			continue;
		}
		$item_IDs[] = $ID;
		$items_by_ID[ $ID ] = [
			'title' => $title,
			'ID' => $ID,
			'url' => $url
		];
	}
	foreach ( $subitems as $id => $subitem ) {
		$items_by_ID[ $id ][ 'submenu' ] = atavist_menu_iterator( $subitem, $level + 1 );
	}
	$return = [];
	foreach ( $item_IDs as $ID ) {
		$return[] = $items_by_ID[ $ID ];
	}
	return $return;
}
function atavist_organization() {
	$custom_logo_id = get_theme_mod( 'custom_logo' );
	$image = wp_get_attachment_image_src( $custom_logo_id , 'full' );
	$menus = [];
	foreach ( wp_get_nav_menus() as $menu ) {
		$slug = $menu->to_array()[ 'slug' ];
		$opts = array(
			'menu' => $slug,
			'echo' => false,
			'container' => false,
			'menu_class' => false
		);
		$menus[ $slug ] = [
			'name' => $menu->to_array()[ 'name' ],
			'items' => atavist_menu_iterator( wp_get_nav_menu_items( $slug ) ),
			'markup' => wp_nav_menu( [
				'menu' => $slug,
				'echo' => false,
				'container' => null
			] )
		];
	}
	return [
		'name' => get_bloginfo( 'name' ),
		'description' => get_bloginfo( 'description' ),
		'url' => get_bloginfo( 'url' ),
		'logo' => $image[0],
		'menus' => $menus
	];
}
function atavist_rest_api_init() {
	register_rest_route( 'atavist/', 'site-options', array(
		'methods' => 'GET',
		'callback' => 'atavist_organization',
	) );
}
add_action( 'init', 'atavist_rest_api_init' );
function atavist_register_atavist_menu() {
  register_nav_menu( 'atavist-menu',__( 'Atavist Menu' ) );
}
add_action( 'init', 'atavist_rest_api_init' );
