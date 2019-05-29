<?php
/**
 * Plugin Name: Full Site Editing
 * Description: Edit all parts of your site with the Block Editor.
 * Version: 1.0
 * Author: Automattic
 * Author URI: https://automattic.com/wordpress-plugins/
 * License: GPLv2 or later
 * Text Domain: full-site-editing
 *
 * @package full-site-editing
 */

/**
 * Load Full Site Editing.
 */
function a8c_load_full_site_editing() {
	require_once __DIR__ . '/lib/feature-flags/feature-flags.php';
	require_once __DIR__ . '/full-site-editing/blocks/post-content/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/template/index.php';
	require_once __DIR__ . '/full-site-editing/class-a8c-rest-templates-controller.php';
	require_once __DIR__ . '/full-site-editing/class-full-site-editing.php';

	Full_Site_Editing::get_instance();
}
add_action( 'plugins_loaded', 'a8c_load_full_site_editing' );

/**
 * Load Posts List Block.
 */
function a8c_load_posts_list_block() {
	if ( function_exists( 'is_automattician' ) && ! is_automattician() ) {
		return;
	}

	if ( class_exists( 'Posts_List_Block' ) ) {
		return;
	}

	require_once __DIR__ . '/posts-list-block/utils.php';
	require_once __DIR__ . '/posts-list-block/class-posts-list-block.php';

	Posts_List_Block::get_instance();
}
add_action( 'plugins_loaded', 'a8c_load_posts_list_block' );

/**
 * Load Starter_Page_Templates.
 */
function a8c_load_starter_page_templates() {
	if ( function_exists( 'is_automattician' ) && ! is_automattician() ) {
		return;
	}

	require_once __DIR__ . '/starter-page-templates/class-starter-page-templates.php';

	Starter_Page_Templates::get_instance();
}
add_action( 'plugins_loaded', 'a8c_load_starter_page_templates' );
