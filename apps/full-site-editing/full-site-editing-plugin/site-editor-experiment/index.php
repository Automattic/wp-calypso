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
	if ( ! is_site_editor_active() ) {
		return;
	}

	// Force enable required Gutenberg experiments if they are not already active.
	add_filter( 'option_gutenberg-experiments', __NAMESPACE__ . '\enable_site_editor_experiment' );

	add_action( 'admin_menu', 'gutenberg_menu' );

	add_action(
		'admin_enqueue_scripts',
		function() {
			do_action( 'enqueue_block_editor_assets' );
		}
	);
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
 * Whether or not core Site Editor is active.
 *
 * @returns bool True if Site Editor is active, false otherwise.
 */
function is_site_editor_active() {
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

	// @TODO - refactor this to filter activation similar to dotcom FSE.
	$is_active = ! apply_filters( 'a8c_disable_core_site_editor', false );

	if ( ! $is_active ) {
		// Check if experiment is enabled: disable if needed.
		if ( gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
			set_site_editor_experiment( '0' );
		}
		return $is_active;
	}

	// Check if experiment is disabled: enable if needed.
	if ( ! gutenberg_is_experiment_enabled( 'gutenberg-full-site-editing' ) ) {
		set_site_editor_experiment( '1' );
	}

	if ( $should_switch ) {
		restore_current_blog();
	}

	return $is_active;
}

/**
 * Used to filter corresponding Site Editor experiment options.
 *
 * These need to be toggled on for the Site Editor to work properly.
 * Furthermore, it's not enough to set them just on a given site.
 * In WP.com context this needs to be enabled in API context too,
 * and since we want to have it selectively enabled for some subset of
 * sites initially, we can't set this option for the whole API.
 * Instead we'll intercept it with it options filter (option_gutenberg-experiments)
 * and override its values for certain sites.
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

	if ( empty( $experiments_option['gutenberg-full-site-editing-demo'] ) ) {
		$experiments_option['gutenberg-full-site-editing-demo'] = 1;
	}

	return $experiments_option;
}
