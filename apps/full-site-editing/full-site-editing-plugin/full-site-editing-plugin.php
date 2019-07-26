<?php
/**
 * Plugin Name: Full Site Editing
 * Description: Enhances your page creation workflow within the Block Editor.
 * Version: 0.4
 * Author: Automattic
 * Author URI: https://automattic.com/wordpress-plugins/
 * License: GPLv2 or later
 * Text Domain: full-site-editing
 *
 * @package full-site-editing
 */

/**
 * Plugin version.
 *
 * Can be used in cache keys to invalidate caches on plugin update.
 *
 * @var string
 */
define( 'A8C_FSE_VERSION', '0.4' );

/**
 * Load Full Site Editing.
 */
function a8c_load_full_site_editing() {
	/**
	 * Can be used to disable Full Site Editing functionality.
	 *
	 * @since 0.2
	 *
	 * @param bool true if Full Site Editing should be disabled, false otherwise.
	 */
	if ( apply_filters( 'a8c_disable_full_site_editing', false ) ) {
		return;
	}

	require_once __DIR__ . '/lib/feature-flags/class-a8c-full-site-editing-feature-flags.php';
	require_once __DIR__ . '/full-site-editing/blocks/navigation-menu/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/post-content/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/site-description/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/site-title/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/template/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/site-logo/index.php';
	require_once __DIR__ . '/full-site-editing/class-a8c-rest-templates-controller.php';
	require_once __DIR__ . '/full-site-editing/class-full-site-editing.php';
	require_once __DIR__ . '/full-site-editing/utils/class-a8c-wp-template.php';

	Full_Site_Editing::get_instance();
}
add_action( 'plugins_loaded', 'a8c_load_full_site_editing' );

/**
 * Load Posts List Block.
 */
function a8c_load_posts_list_block() {
	if ( class_exists( 'Posts_List_Block' ) ) {
		return;
	}

	/**
	 * Can be used to disable the Post List Block.
	 *
	 * @since 0.2
	 *
	 * @param bool true if Post List Block should be disabled, false otherwise.
	 */
	if ( apply_filters( 'a8c_disable_post_list_block', false ) ) {
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
	/**
	 * Can be used to disable the Starter Page Templates.
	 *
	 * @since 0.2
	 *
	 * @param bool true if Starter Page Templates should be disabled, false otherwise.
	 */
	if ( apply_filters( 'a8c_disable_starter_page_templates', false ) ) {
		return;
	}

	require_once __DIR__ . '/starter-page-templates/class-starter-page-templates.php';

	Starter_Page_Templates::get_instance();
}
add_action( 'plugins_loaded', 'a8c_load_starter_page_templates' );
