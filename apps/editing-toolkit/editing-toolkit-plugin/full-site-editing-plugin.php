<?php
/**
 * Plugin Name: WordPress.com Editing Toolkit
 * Description: Enhances your page creation workflow within the Block Editor.
 * Version: 2.9
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
 * which could cause bugs. For example, dotcom FSE files are only loaded if dotcom
 * FSE isactive on the site.
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
define( 'PLUGIN_VERSION', '2.9' );

// Always include these helper files for dotcom FSE.
require_once __DIR__ . '/dotcom-fse/helpers.php';

/**
 * Use this function to use webpack-generated assets for your module. By default,
 * this uses "wp_enqueue_script" and "wp_enqueue_style" for any style and scripts
 * which match the name you give, and which exist in the "/dist" directory.
 *
 * The main requirement is that the name you pass to this function must match the
 * name of an asset in the "dist/" directory, disregarding extensions. By default,
 * all top-level directories in "editing-toolkit-plugin" with an index.js or index.ts
 * file are compiled into the "dist/" directory. Therefore, you can simply create
 * a new directory for your feature with an index.ts file, and then use this function
 * from PHP to add the assets via WordPress.
 *
 * For example, say you are developing a feature in "editing-toolkit-plugin/new-feature",
 * and you have an index.ts file in the top-level directory. You can add your
 * JS asset simpley by calling "use_webpack_assets( 'new-feature' );". If you also
 * use .scss files, those will be enqueued as well if they exist. Scripts are also
 * only enqueued if they exist.
 *
 * Note: this function prepends "a8c-etk-" to the handle of the script. So if you
 * are loading the asset "block-patterns", this will get the handle "a8c-etk-block-patterns".
 * You can access the generated handle from the return value.
 *
 * You can also have this function only register the script by passing "register_only => true"
 * to the $options parameter. This will use wp_register_x instead of wp_enqueue_x.
 * Then, you can enqueue the asset later using the handle given in the return value.
 *
 * @param {string} $filename The name of the script + style to enqueue, without
 *                           extensions or paths (E.g. "block-patterns").
 * @param {array}  $options  Options to configure how assets are loaded.
 *                           - register_only:  Uses wp_register_ instead of wp_enqueue_.
 *                                             You must then enqueue at some point if you need to use it.
 *                                             Defaults to false.
 *                           - exclude_script: Do not register the script, even if it exists. Defaults to false.
 *                           - exclude_style:  Do not register the style, even if it exists. Defaults to false.
 *                           - in_footer:      Whether to enqueue the script before body instead of in head. Defaults to true.
 * @return {array} Details about the assets.
 *                 -asset_handle: The name of the asset in the handle, with prefix. Like "a8c-etk-block-patterns".
 *                 -asset_dir_url: The URL to the directory of the assets (using `plugins_url`).
 */
function use_webpack_assets( $filename, $options = array() ) {
	// Add a prefix to ensure the script is unique.
	$asset_handle  = "a8c-etk-$filename";
	$asset_file    = include plugin_dir_path( __FILE__ ) . "dist/$filename.asset.php";
	$register_only = isset( $options['register_only'] ) && $options['register_only'];

	$script_dependencies = $asset_file['dependencies'] ?? array();
	$script_path         = "dist/$filename.js";

	$exclude_script = isset( $options['exclude_script'] ) && $options['exclude_script'];
	if ( ! $exclude_script && file_exists( __DIR__ . $script_path ) ) {
		$script_version      = $asset_file['version'] ?? filemtime( plugin_dir_path( __FILE__ ) . $script_path );
		$enqueue_or_register = $register_only ? 'wp_register_script' : 'wp_enqueue_script';
		$enqueue_or_register(
			$asset_handle,
			plugins_url( $script_path, __FILE__ ),
			$script_dependencies,
			$script_version,
			$options['in_footer'] ?? true
		);
		wp_set_script_translations( $asset_handle, 'full-site-editing' );
	}

	$style_ext  = is_rtl() ? $filename . '.rtl.css' : $filename . '.css';
	$style_path = "dist/$style_ext";

	$exclude_style = isset( $options['exclude_style'] ) && $options['exclude_style'];
	if ( ! $exclude_style && file_exists( __DIR__ . $style_path ) ) {
		$style_version       = $asset_file['version'] ?? filemtime( plugin_dir_path( __FILE__ ) . $style_path );
		$enqueue_or_register = $register_only ? 'wp_register_style' : 'wp_enqueue_style';
		$enqueue_or_register(
			$asset_handle,
			plugins_url( $style_path, __FILE__ ),
			array(),
			$style_version
		);
	}

	return array(
		'asset_handle'  => $asset_handle,
		'asset_dir_url' => plugins_url( 'dist/', __FILE__ ),
	);
}

/**
 * Load dotcom-FSE.
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
 * Sigh: load_editor_site_launch
 */
function load_editor_site_launch() {
	require_once __DIR__ . '/editor-site-launch/index.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_editor_site_launch' );

/**
 * Sigh: load_editor_gutenboarding_launch
 */
function load_editor_gutenboarding_launch() {
	require_once __DIR__ . '/editor-gutenboarding-launch/index.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_editor_gutenboarding_launch' );

/**
 * Add front-end CoBlocks gallery block scripts.
 *
 * This function performs the same enqueueing duties as `CoBlocks_Block_Assets::frontend_scripts`,
 * but for dotcom FSE header and footer content. `frontend_scripts` uses
 * `has_block` to determine if gallery blocks are present, and `has_block` is
 * not aware of content sections outside of post_content yet.
 */
function enqueue_coblocks_gallery_scripts() {
	if ( ! function_exists( 'CoBlocks' ) || ! is_full_site_editing_active() ) {
		return;
	}

	// This happens in the Customizer because we try very hard not to load things and we get a fatal
	// https://github.com/Automattic/wp-calypso/issues/36680.
	if ( ! class_exists( '\A8C\FSE\WP_Template' ) ) {
		require_once __DIR__ . '/dotcom-fse/templates/class-wp-template.php';
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
	// Use regex instead of static slug in order to match plugin installation also from github, where slug may contain (HASH|branch-name).
	$slug_regex    = '/newspack-blocks(-[A-Za-z0-9-]+)?\/newspack-blocks\.php/';
	$disable_block = (
		( defined( 'WP_CLI' ) && WP_CLI ) ||
		/* phpcs:ignore WordPress.Security.NonceVerification */
		( isset( $_GET['action'], $_GET['plugin'] ) && 'activate' === $_GET['action'] && preg_match( $slug_regex, sanitize_text_field( wp_unslash( $_GET['plugin'] ) ) ) ) ||
		preg_grep( $slug_regex, (array) get_option( 'active_plugins' ) ) ||
		preg_grep( $slug_regex, (array) get_site_option( 'active_sitewide_plugins' ) )
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

	require_once __DIR__ . '/newspack-blocks/index.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_blog_posts_block' );

/**
 * Load WPCOM Block Editor NUX
 */
function load_wpcom_block_editor_nux() {
	// Show the Welcome Tour for any sandbox/site with SHOW_WELCOME_TOUR constant or filter setting.
	if ( defined( 'SHOW_WELCOME_TOUR' ) && SHOW_WELCOME_TOUR || apply_filters( 'a8c_enable_wpcom_welcome_tour', false ) ) {
		require_once __DIR__ . '/wpcom-block-editor-welcome-tour/class-wpcom-block-editor-welcome-tour.php';
		return;
	} else {
		require_once __DIR__ . '/wpcom-block-editor-nux/class-wpcom-block-editor-nux.php';
	}
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_wpcom_block_editor_nux' );

/**
 * Load editing toolkit block patterns from the API
 *
 * @param obj $current_screen The current screen object.
 */
function load_block_patterns_from_api( $current_screen ) {
	if ( ! apply_filters( 'a8c_enable_block_patterns_api', false ) ) {
		return;
	}

	if ( ! function_exists( '\gutenberg_load_block_pattern' ) ) {
		return;
	}

	if ( ! $current_screen->is_block_editor ) {
		return;
	}

	require_once __DIR__ . '/block-patterns/class-block-patterns-from-api.php';
	Block_Patterns_From_API::get_instance();
}
add_action( 'current_screen', __NAMESPACE__ . '\load_block_patterns_from_api' );

/**
 * Load WPCOM Block Patterns Modifications
 *
 * This is responsible for modifying how block patterns behave in the editor,
 * including adding support for premium block patterns. The patterns themselves
 * are loaded via load_block_patterns_from_api.
 */
function load_wpcom_block_patterns_modifications() {
	if ( apply_filters( 'a8c_enable_block_patterns_modifications', false ) ) {
		require_once __DIR__ . '/block-patterns/class-block-patterns-modifications.php';
	}
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_wpcom_block_patterns_modifications' );


/**
 * Load Premium Content Block
 */
function load_premium_content() {
	/**
	 * Disabled until we're ready to disable the premium content plugin in mp-plugins/earn
	 */
	if ( function_exists( '\A8C\FSE\Earn\PremiumContent\premium_content_block_init' ) ) {
		return;
	}
	require_once __DIR__ . '/premium-content/premium-content.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_premium_content' );

/**
 * Load Block Inserter Modifications module
 */
function load_block_inserter_modifications() {
	require_once __DIR__ . '/block-inserter-modifications/index.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_block_inserter_modifications' );

/**
 * Load Mailerlite module
 */
function load_mailerlite() {
	require_once __DIR__ . '/mailerlite/subscriber-popup.php';
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_mailerlite' );

/**
 * Load WPCOM block editor nav sidebar
 */
function load_wpcom_block_editor_sidebar() {
	if (
		( defined( 'WPCOM_BLOCK_EDITOR_SIDEBAR' ) && WPCOM_BLOCK_EDITOR_SIDEBAR ) ||
		apply_filters( 'a8c_enable_nav_sidebar', false )
	) {
		require_once __DIR__ . '/wpcom-block-editor-nav-sidebar/class-wpcom-block-editor-nav-sidebar.php';
	}
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_wpcom_block_editor_sidebar' );

/**
 * Coming soon
 */
function load_coming_soon() {
	if (
		( defined( 'WPCOM_PUBLIC_COMING_SOON' ) && WPCOM_PUBLIC_COMING_SOON ) ||
		apply_filters( 'a8c_enable_public_coming_soon', false )
	) {
		require_once __DIR__ . '/coming-soon/coming-soon.php';
	}
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_coming_soon' );
