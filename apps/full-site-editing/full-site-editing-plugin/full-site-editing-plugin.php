<?php
/**
 * Plugin Name: Full Site Editing
 * Description: Enhances your page creation workflow within the Block Editor.
 * Version: 1.1
 * Author: Automattic
 * Author URI: https://automattic.com/wordpress-plugins/
 * License: GPLv2 or later
 * Text Domain: full-site-editing
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * This file should only be used to load files needed for each subfeature.
 *
 * For example, if you are adding a new feature to this plugin called "Foo",
 * you would create a directory `./foo` to contain all code needed by your
 * feature. Then, in this file, you would add a `load_foo()` function which
 * includes your feature's files via the 'plugins_loaded' action.
 *
 * Please take care to _not_ load your feature's files if there are situations
 * which could cause bugs. For example, FSE files are only loaded if FSE is
 * active on the site.
 *
 * Finally, don't forget to use the A8C\FSE namespace for your code. :)
 */

/**
 * Plugin version.
 *
 * Can be used in cache keys to invalidate caches on plugin update.
 *
 * @var string
 */
define( 'PLUGIN_VERSION', '1.1' );

// Always include these helper files for dotcom FSE.
require_once __DIR__ . '/dotcom-fse/helpers.php';

/**
 * Load Core Site Editor.
 */
function load_core_site_editor() {
	require_once __DIR__ . '/site-editor/index.php';
	initialize_site_editor();
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_core_site_editor' );

/**
 * Load Full Site Editing.
 */
function load_full_site_editing() {
	// Bail if FSE should not be active on the site. We do not
	// want to load FSE functionality on non-supported sites!
	if ( ! is_full_site_editing_active() ) {
		return;
	}
	// Not dangerous here since we have already checked for eligibility.
	dangerously_load_full_site_editing_files();
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
	// We don't want the user to choose a template when copying a post.
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['jetpack-copy'] ) ) {
		return;
	}

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
 * Load Global Styles plugin.
 */
function load_global_styles() {
	require_once __DIR__ . '/global-styles/class-global-styles.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_global_styles' );

/**
 * Load Event Countdown Block
 */
function load_countdown_block() {
	require_once __DIR__ . '/event-countdown-block/index.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_countdown_block' );

/**
 * Load Timeline Block
 */
function load_timeline_block() {
	require_once __DIR__ . '/jetpack-timeline/index.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_timeline_block' );

/**
 * Load common module.
 */
function load_common_module() {
	require_once __DIR__ . '/common/index.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_common_module' );

/**
 * Add front-end CoBlocks gallery block scripts.
 *
 * This function performs the same enqueueing duties as `CoBlocks_Block_Assets::frontend_scripts`,
 * but for our FSE header and footer content. `frontend_scripts` uses `has_block` to determine
 * if gallery blocks are present, and `has_block` is not aware of content sections outside of
 * post_content yet.
 */
function enqueue_coblocks_gallery_scripts() {
	if ( ! function_exists( 'CoBlocks' ) || ! is_full_site_editing_active() ) {
		return;
	}

	// This happens in the Customizer because we try very hard not to load things and we get a fatal
	// https://github.com/Automattic/wp-calypso/issues/36680.
	if ( ! class_exists( '\A8C\FSE\WP_Template' ) ) {
		require_once __DIR__ . '/full-site-editing/templates/class-wp-template.php';
	}
	$template = new WP_Template();
	$header   = $template->get_template_content( 'header' );
	$footer   = $template->get_template_content( 'footer' );

	// Define where the asset is loaded from.
	$dir = CoBlocks()->asset_source( 'js' );

	// Define where the vendor asset is loaded from.
	$vendors_dir = CoBlocks()->asset_source( 'js', 'vendors' );

	// Masonry block.
	if ( has_block( 'coblocks/gallery-masonry', $header . $footer ) ) {
		wp_enqueue_script(
			'coblocks-masonry',
			$dir . 'coblocks-masonry' . COBLOCKS_ASSET_SUFFIX . '.js',
			array( 'jquery', 'masonry', 'imagesloaded' ),
			COBLOCKS_VERSION,
			true
		);
	}

	// Carousel block.
	if ( has_block( 'coblocks/gallery-carousel', $header . $footer ) ) {
		wp_enqueue_script(
			'coblocks-flickity',
			$vendors_dir . '/flickity' . COBLOCKS_ASSET_SUFFIX . '.js',
			array( 'jquery' ),
			COBLOCKS_VERSION,
			true
		);
	}
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_coblocks_gallery_scripts' );

/**
 * Load Blog Posts block.
 */
function load_blog_posts_block() {
	$slug          = 'newspack-blocks/newspack-blocks.php';
	$disable_block = (
		( defined( 'WP_CLI' ) && WP_CLI ) ||
		/* phpcs:ignore WordPress.Security.NonceVerification */
		( isset( $_GET['action'], $_GET['plugin'] ) && 'activate' === $_GET['action'] && $slug === $_GET['plugin'] ) ||
		in_array( $slug, (array) get_option( 'active_plugins', array() ), true ) ||
		in_array( $slug, (array) get_site_option( 'active_sitewide_plugins', array() ), true )
	);

	/**
	 * Can be used to disable the Blog Posts block.
	 *
	 * @since 0.15.1
	 *
	 * @param bool $disable_block True if Blog Posts block should be enabled, false otherwise.
	 */
	if ( apply_filters( 'a8c_disable_blog_posts_block', $disable_block ) ) {
		return;
	}

	require_once __DIR__ . '/blog-posts-block/index.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_blog_posts_block' );

/**
 * Load WPCOM Block Editor NUX
 */
function load_wpcom_block_editor_nux() {

	require_once __DIR__ . '/wpcom-block-editor-nux/class-wpcom-block-editor-nux.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_wpcom_block_editor_nux' );

/**
 * Load FSE block patterns
 */
function load_block_patterns() {
	if ( ! function_exists( '\gutenberg_load_block_pattern' ) ) {
		return;
	}

	require_once __DIR__ . '/block-patterns/class-block-patterns.php';

	Block_Patterns::get_instance();
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_block_patterns' );
