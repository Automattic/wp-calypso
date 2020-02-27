<?php
/**
 * Site Editor experiment file.
 *
 * @package A8C\FSE
 */

namespace A8C\FSE;

/**
 * Enables/Disables site editor experiment per blog sticker.
 */
function conditionally_enable_site_editor() {

	// Check blog sticker for access to Site Editor.
	if ( ! has_blog_sticker( 'core_site_editor_enabled' ) ) {

		// Check if experiment is enabled: disable if needed.
		if ( gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
			set_site_editor_experiment( '0' );
		}
		return;
	}

	// Check if experiment is disabled: enable if needed.
	if ( ! gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
		set_site_editor_experiment( '1' );
	}

	add_site_editor_plugin_page();
}

/**
 * Sets the Site Editor experiment on or off.
 *
 * @param {string} $value - '0' for OFF, '1' for ON.
 */
function set_site_editor_experiment( $value ) {
	$options = get_option( 'gutenberg-experiments' );

	// Initialize options array if needed (may be set to false by default on dotcom).
	if ( ! $options ) {
		$options = array();
	}
	$options['gutenberg-full-site-editing']      = $value;
	$options['gutenberg-full-site-editing-demo'] = $value;
	update_option( 'gutenberg-experiments', $options );
}

/**
 * Adds Site Editor page to wp-admin sidebar.
 */
function add_site_editor_plugin_page() {

	// Site Editor must be nested as a 'gutenberg' subpage to fire correct hook.
	// May need to change core code or hack the hook somehow if we want it at top level.
	add_menu_page(
		'Gutenberg',
		'Gutenberg',
		'edit_posts',
		'gutenberg',
		// This callback effectively loads the Gutenberg Demo from here.
		// If empty '' on dotcom it loads the broken homepage.
		'anything',
		'dashicons-edit'
	);

	add_submenu_page(
		'gutenberg',
		__( 'Site Editor (beta)', 'gutenberg' ),
		__( 'Site Editor (beta)', 'gutenberg' ),
		'edit_theme_options',
		'gutenberg-edit-site',
		'gutenberg_edit_site_page'
	);
}
