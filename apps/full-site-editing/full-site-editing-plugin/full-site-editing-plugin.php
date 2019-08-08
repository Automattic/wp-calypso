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
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Plugin version.
 *
 * Can be used in cache keys to invalidate caches on plugin update.
 *
 * @var string
 */
define( 'PLUGIN_VERSION', '0.4' );

/**
 * Load Full Site Editing.
 */
function load_full_site_editing() {
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

	require_once __DIR__ . '/lib/feature-flags/class-feature-flags.php';
	require_once __DIR__ . '/full-site-editing/blocks/navigation-menu/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/post-content/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/site-description/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/site-title/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/template/index.php';
	require_once __DIR__ . '/full-site-editing/class-rest-templates-controller.php';
	require_once __DIR__ . '/full-site-editing/class-full-site-editing.php';
	require_once __DIR__ . '/full-site-editing/templates/class-wp-template.php';
	require_once __DIR__ . '/full-site-editing/templates/class-wp-template-inserter.php';
	require_once __DIR__ . '/full-site-editing/serialize-block-fallback.php';

	Full_Site_Editing::get_instance();
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_full_site_editing' );

/**
 * Load Posts List Block.
 */
function load_posts_list_block() {
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
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_posts_list_block' );

/**
 * Load Starter_Page_Templates.
 */
function load_starter_page_templates() {
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
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_starter_page_templates' );

/**
 * Inserts default template data for current theme during plugin activation.
 * We usually perform this on theme activation hook, but this is needed to handle
 * the cases in which FSE supported theme was activated prior to the plugin.
 */
function populate_wp_template_data() {
	require_once __DIR__ . '/full-site-editing/class-full-site-editing.php';
	require_once __DIR__ . '/full-site-editing/templates/class-wp-template-inserter.php';

	$fse = Full_Site_Editing::get_instance();
	$fse->wp_template_inserter->insert_default_template_data();
}
register_activation_hook( __FILE__, __NAMESPACE__ . '\populate_wp_template_data' );
