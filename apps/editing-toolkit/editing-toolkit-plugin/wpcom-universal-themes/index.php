<?php
/**
 * For supporting classic and block themes on WPcom.
 *
 * Themes with support for Full Site Editing will not be automatically activated into FSE mode.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * This is the option name for enabling/disabling.
 */
define( 'ACTIVATE_FSE_OPTION_NAME', 'wpcom_is_fse_activated' );

/**
 * TODO - NOTE - This function becomes unnecessary when we enable all universal themes to run in FSE
 * mode as it can be replaced by `is_fse_theme`. We can clean this up after removing backend
 * references.
 *
 * Checks if Core's FSE is active via this plugin, always returning false when
 * `gutenberg_is_fse_theme` is false.
 *
 * @return boolean Core FSE is active.
 */
function is_core_fse_active() {
	// Always run FSE for eligible themes, including universal.
	return is_fse_theme();
}

/**
 * Proxy for `gutenberg_is_fse_theme` or `wp_is_block_theme` with `function_exists` guarding.
 *
 * @uses gutenberg_is_fse_theme
 * @uses wp_is_block_theme
 *
 * @return boolean
 */
function is_fse_theme() {
	// Gutenberg check, prior to WP 5.9.
	if ( function_exists( 'gutenberg_is_fse_theme' ) ) {
		return gutenberg_is_fse_theme();
	}

	// Core check, added in WP 5.9.
	if ( function_exists( 'wp_is_block_theme' ) ) {
		return wp_is_block_theme();
	}

	return false;
}

/**
 * To identify universal themes, we assume that child themes will
 * all use blockbase as their default theme template. This
 * function checks if the current template is a blockbase template.
 *
 * @return boolean
 */
function is_universal_theme() {
	return 'blockbase' === basename( get_template() );
}

/**
 * TODO - Cleanup once backend references are removed, this option is no longer required to run FSE
 * for universal themes.
 *
 * Activates Core FSE by setting our option. Note that even setting this
 * option to true will make no difference on a classic theme.
 *
 * @return void
 */
function activate_core_fse() {
	update_option( ACTIVATE_FSE_OPTION_NAME, true );
}

/**
 * TODO - Cleanup once backend references are removed, this option is no longer required to run FSE
 * for universal themes.
 *
 * Deactivates Core FSE by setting the option to NULL (matches the Options API).
 *
 * @return void
 */
function deactivate_core_fse() {
	update_option( ACTIVATE_FSE_OPTION_NAME, null );
}

/**
 * Hook and unhook Gutenberg's FSE things.
 *
 * @return void
 */
function load_core_fse() {
	// perfect parity would put the admin notices back but we don't want that.
	add_action( 'admin_menu', __NAMESPACE__ . '\hide_nav_menus_submenu' );
}

/**
 * Unhooks the Gutenberg notice for Full Site Editing.
 *
 * @return void
 */
function unload_core_fse() {
	remove_action( 'admin_menu', __NAMESPACE__ . '\hide_nav_menus_submenu' );
	remove_action( 'admin_notices', 'gutenberg_full_site_editing_notice' );
}

/**
 * Loads our menus
 *
 * @return void
 */
function load_helpers() {
	// we don't need to show anything to non-FSE-capable themes.
	if ( ! is_fse_theme() ) {
		return;
	}

	// Amp plugin helper.
	add_action( 'admin_menu', __NAMESPACE__ . '\maybe_juggle_amp_priority', 0 );

	if ( apply_filters( 'a8c_hide_core_fse_activation', false ) ) {
		return;
	}
	// This menu toggles site editor visibility for universal themes.
	// It's unnecessary for block themes because the site editor
	// will always be visible.
	add_action( 'admin_init', __NAMESPACE__ . '\init_settings' );
}

/**
 * Unloads our menus
 *
 * @return void
 */
function unload_helpers() {
	remove_action( 'admin_init', __NAMESPACE__ . '\init_settings' );
	remove_action( 'admin_menu', __NAMESPACE__ . '\maybe_juggle_amp_priority', 0 );
}

/**
 * AMP registration on the default 10 priority is too early and confuses the current Gutenberg
 * plugin's `gutenberg_remove_legacy_pages` function into mistaking it for the Customizer proper.
 *
 * This will be fixed once https://github.com/WordPress/gutenberg/pull/38598 is released.
 *
 * @return void
 */
function maybe_juggle_amp_priority() {
	if ( ! function_exists( 'amp_add_customizer_link' ) || ! has_action( 'admin_menu', 'amp_add_customizer_link' ) ) {
		return;
	}

	remove_action( 'admin_menu', 'amp_add_customizer_link' );
	add_action( 'admin_menu', 'amp_add_customizer_link', 11 );
}

/**
 * Adds our settings sections and fields
 *
 * @return void
 */
function init_settings() {
	// TODO - Clean up this setting registration once we clean up adding this setting on site
	// creation.
	register_setting(
		'site-editor-toggle',
		ACTIVATE_FSE_OPTION_NAME
	);
}

/**
 * Hide the (Nav) Menus submenu when site editing is enabled
 *
 * @return void
 */
function hide_nav_menus_submenu() {
	remove_submenu_page( 'themes.php', 'nav-menus.php' );
}

/**
 * Run everything
 *
 * @return void
 */
function init() {
	// always unload first since we will add below only when needed.
	unload_core_fse();
	unload_helpers();

	load_helpers();
	if ( is_core_fse_active() ) {
		load_core_fse();
	}
}
// For WPcom REST API requests to work properly.
add_action( 'restapi_theme_init', __NAMESPACE__ . '\init' );
// Just run it.
init();
