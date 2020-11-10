<?php
/**
 * WP.com Site Editor.
 *
 * The purpose of this code is to allow us to use core's Site Editor experiment
 * on Dotcom and Atomic. The corresponding core functionality is initialized here:
 * https://github.com/WordPress/gutenberg/blob/HEAD/lib/edit-site-page.php
 *
 * We should aim to reuse as much of the core code as possible and use this to adjust it to some
 * specifics of our platforms, or in cases when we want to extend the default experience.
 *
 * It's end goal is somewhat similar to the dotcom-fse project that's also part of this plugin.
 * The difference being that that was a custom Dotcom solution and this one is being built on
 * top of core FSE. When ready, it should completely replace the existing dotcom-fse functionality.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Enables/Disables site editor experiment per blog sticker.
 */
function initialize_site_editor() {
	if ( ! is_site_editor_active() ) {
		return;
	}

	// Add top level Site Editor menu item.
	add_action( 'admin_menu', __NAMESPACE__ . '\add_site_editor_menu_item' );
}

/**
 * Add top level Site Editor menu item.
 */
function add_site_editor_menu_item() {
	add_menu_page(
		__( 'Site Editor (beta)', 'full-site-editing' ),
		__( 'Site Editor (beta)', 'full-site-editing' ),
		'edit_theme_options',
		'gutenberg-edit-site',
		'gutenberg_edit_site_page',
		'dashicons-edit'
	);
}

/**
 * Whether or not core Site Editor is active.
 *
 * @returns bool True if Site Editor is active, false otherwise.
 */
function is_site_editor_active() {
	/**
	 * Can be used to enable Site Editor functionality.
	 *
	 * @since 0.22
	 *
	 * @param bool true if Site Editor should be enabled, false otherwise.
	 */
	return apply_filters( 'a8c_enable_core_site_editor', false );
}
