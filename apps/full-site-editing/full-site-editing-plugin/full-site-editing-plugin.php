<?php
/**
 * Plugin Name: Full Site Editing
 * Description: Enhances your page creation workflow within the Block Editor.
 * Version: 0.14
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
define( 'PLUGIN_VERSION', '0.14' );

// Themes which are supported by Full Site Editing (not the same as the SPT themes).
const SUPPORTED_THEMES = [ 'maywood' ];

/**
 * Load Full Site Editing.
 */
function load_full_site_editing() {
	// Bail if FSE should not be active on the site. We do not
	// want to load FSE functionality on non-supported sites!
	if ( ! is_full_site_editing_active() ) {
		return;
	}

	require_once __DIR__ . '/full-site-editing/blocks/navigation-menu/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/post-content/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/site-description/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/site-title/index.php';
	require_once __DIR__ . '/full-site-editing/blocks/template/index.php';
	require_once __DIR__ . '/full-site-editing/class-full-site-editing.php';
	require_once __DIR__ . '/full-site-editing/templates/class-rest-templates-controller.php';
	require_once __DIR__ . '/full-site-editing/templates/class-wp-template.php';
	require_once __DIR__ . '/full-site-editing/templates/class-wp-template-inserter.php';
	require_once __DIR__ . '/full-site-editing/templates/class-template-image-inserter.php';
	require_once __DIR__ . '/full-site-editing/serialize-block-fallback.php';

	Full_Site_Editing::get_instance();
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_full_site_editing' );

/**
 * Whether or not FSE is active.
 * If false, FSE functionality can be disabled.
 *
 * @returns bool True if FSE is active, false otherwise.
 */
function is_full_site_editing_active() {
	return is_site_eligible_for_full_site_editing() && is_theme_supported();
}

/**
 * Returns normalized theme slug for the current theme.
 *
 * Normalize WP.com theme slugs that differ from those that we'll get on self hosted sites.
 * For example, we will get 'modern-business-wpcom' when retrieving theme slug on self hosted sites,
 * but due to WP.com setup, on Simple sites we'll get 'pub/modern-business' for the theme.
 *
 * @return string Normalized theme slug.
 */
function get_theme_slug() {
	/**
	 * Used to get the correct theme in certain contexts.
	 *
	 * For example, in the wpcom API context, the theme slug is a8c/public-api, so we need
	 * to grab the correct one with the filter.
	 *
	 * @since 0.7
	 *
	 * @param string current theme slug is the default if nothing overrides it.
	 */
	$theme_slug = apply_filters( 'a8c_fse_get_theme_slug', get_stylesheet() );

	// Normalize the theme slug.
	if ( 'pub/' === substr( $theme_slug, 0, 4 ) ) {
		$theme_slug = substr( $theme_slug, 4 );
	}

	if ( '-wpcom' === substr( $theme_slug, -6, 6 ) ) {
		$theme_slug = substr( $theme_slug, 0, -6 );
	}

	return $theme_slug;
}

/**
 * Whether or not the site is eligible for FSE.
 * This is essentially a feature gate to disable FSE
 * on some sites which could theoretically otherwise use it.
 *
 * @return bool True if current site is eligible for FSE, false otherwise.
 */
function is_site_eligible_for_full_site_editing() {
	/**
	 * Can be used to disable Full Site Editing functionality.
	 *
	 * @since 0.2
	 *
	 * @param bool true if Full Site Editing should be disabled, false otherwise.
	 */
	return ! apply_filters( 'a8c_disable_full_site_editing', false );
}

/**
 * Whether or not current theme is enabled for FSE.
 *
 * @return bool True if current theme supports FSE, false otherwise.
 */
function is_theme_supported() {
	return in_array( get_theme_slug(), SUPPORTED_THEMES, true );
}

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
	// phpcs:ignore WordPress.Security.NonceVerification.NoNonceVerification
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
	if ( is_site_eligible_for_full_site_editing() ) {
		require_once __DIR__ . '/global-styles/class-global-styles.php';
	}
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\load_global_styles' );

/**
 * Inserts default full site editing data for current theme during plugin activation.
 *
 * We usually perform this on theme activation hook, but this is needed to handle
 * the cases in which FSE supported theme was activated prior to the plugin. This will
 * populate the default header and footer for current theme, and create About and Contact
 * pages provided that they don't already exist.
 */
function populate_wp_template_data() {
	require_once __DIR__ . '/full-site-editing/class-full-site-editing.php';
	require_once __DIR__ . '/full-site-editing/templates/class-template-image-inserter.php';
	require_once __DIR__ . '/full-site-editing/templates/class-wp-template-inserter.php';

	$fse = Full_Site_Editing::get_instance();
	$fse->insert_default_data();
}
register_activation_hook( __FILE__, __NAMESPACE__ . '\populate_wp_template_data' );

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
