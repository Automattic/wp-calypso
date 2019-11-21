<?php
/**
 * Plugin Name: Full Site Editing
 * Description: Enhances your page creation workflow within the Block Editor.
 * Version: 0.15.1
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
define( 'PLUGIN_VERSION', '0.15.1' );

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
 * NOTE: In most cases, you should NOT use this function. Please use
 * load_full_site_editing instead. This function should only be used if you need
 * to include the FSE files somewhere like a script. I.e. if you want to access
 * a class defined here without needing full FSE functionality.
 */
function dangerously_load_full_site_editing_files() {
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
}

/**
 * Whether or not FSE is active.
 * If false, FSE functionality should be disabled.
 *
 * @returns bool True if FSE is active, false otherwise.
 */
function is_full_site_editing_active() {
	/**
	 * There are times when this function is called from the WordPress.com public
	 * API context. In this case, we need to switch to the correct blog so that
	 * the functions reference the correct blog context.
	 */
	$multisite_id  = apply_filters( 'a8c_fse_get_multisite_id', false );
	$should_switch = is_multisite() && $multisite_id;
	if ( $should_switch ) {
		switch_to_blog( $multisite_id );
	}

	$is_active = is_site_eligible_for_full_site_editing() && is_theme_supported() && did_insert_template_parts();

	if ( $should_switch ) {
		restore_current_blog();
	}
	return $is_active;
}

/**
 * Returns the slug for the current theme.
 *
 * This even works for the WordPress.com API context where the current theme is
 * not correct. The filter correctly switches to the correct blog context if
 * that is the case.
 *
 * @return string Theme slug.
 */
function get_theme_slug() {
	/**
	 * Used to get the correct theme in certain contexts.
	 *
	 * For example, in the wpcom API context, the theme slug is a8c/public-api,
	 * so we need to grab the correct one with the filter.
	 *
	 * @since 0.7
	 *
	 * @param string current theme slug is the default if nothing overrides it.
	 */
	return apply_filters( 'a8c_fse_get_theme_slug', get_stylesheet() );
}

/**
 * Returns a normalized slug for the current theme.
 *
 * In some cases, the theme is located in a subfolder like `pub/maywood`. Use
 * this function to get the slug without the prefix.
 *
 * @param string $theme_slug The raw theme_slug to normalize.
 * @return string Theme slug.
 */
function normalize_theme_slug( $theme_slug ) {
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
 * Whether or not the site is eligible for FSE. This is essentially a feature
 * gate to disable FSE on some sites which could theoretically otherwise use it.
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
	// Use un-normalized theme slug because get_theme requires the full string.
	$theme = wp_get_theme( get_theme_slug() );
	return ! $theme->errors() && in_array( 'full-site-editing', $theme->tags, true );
}

/**
 * Determines if the template parts have been inserted for the current theme.
 *
 * We want to gate on this check in is_full_site_editing_active so that we don't
 * load FSE for sites which did not get template parts for some reason or another.
 *
 * For example, if a user activates theme A on their site and gets FSE, but then
 * activates theme B which does not have FSE, they will not get FSE flows. If we
 * retroactively add FSE support to theme B, the user should not get FSE flows
 * because their site would be modified. Instead, FSE flows would become active
 * when they specifically take action to re-activate the theme.
 *
 * @return bool True if the template parts have been inserted. False otherwise.
 */
function did_insert_template_parts() {
	require_once __DIR__ . '/full-site-editing/templates/class-wp-template-inserter.php';

	$theme_slug = normalize_theme_slug( get_theme_slug() );
	$inserter   = new WP_Template_Inserter( $theme_slug );
	return $inserter->is_template_data_inserted();
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
 * Inserts default full site editing data for current theme on plugin/theme activation.
 *
 * We put this here outside of the normal FSE class because FSE is not active
 * until the template parts are inserted. This makes sure we insert the template
 * parts when switching to a theme which supports FSE.
 *
 * This will populate the default header and footer for current theme, and create
 * About and Contact pages. Nothing will populate if the data already exists, or
 * if the theme is unsupported.
 */
function populate_wp_template_data() {
	require_once __DIR__ . '/full-site-editing/class-full-site-editing.php';
	require_once __DIR__ . '/full-site-editing/templates/class-template-image-inserter.php';
	require_once __DIR__ . '/full-site-editing/templates/class-wp-template-inserter.php';

	$fse = Full_Site_Editing::get_instance();
	$fse->insert_default_data();
}
register_activation_hook( __FILE__, __NAMESPACE__ . '\populate_wp_template_data' );
add_action( 'after_switch_theme', __NAMESPACE__ . '\populate_wp_template_data' );

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
