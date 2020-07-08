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

	// Force enable required Gutenberg experiments if they are not already active.
	add_filter( 'pre_option_gutenberg-experiments', __NAMESPACE__ . '\enable_site_editor_experiment' );
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
 * Used to filter corresponding Site Editor experiment options.
 *
 * This needs to be toggled on for the Site Editor to work properly.
 * Furthermore, it's not enough to set it just on a given site.
 * In WP.com context this needs to be enabled in API context too,
 * and since we want to have it selectively enabled for some subset of
 * sites initially, we can't set this option for the whole API.
 * Instead we'll intercept it with its options filter (pre_option_gutenberg-experiments)
 * and override its values for eligible sites.
 *
 * @param array $experiments_option Default experiments option array.
 *
 * @return array Experiments option array with FSE values enabled.
 */
function enable_site_editor_experiment( $experiments_option ) {
	if ( ! is_array( $experiments_option ) ) {
		$experiments_option = array();
	}

	if ( empty( $experiments_option['gutenberg-full-site-editing'] ) ) {
		$experiments_option['gutenberg-full-site-editing'] = 1;
	}

	return $experiments_option;
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
