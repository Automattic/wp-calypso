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
function initialize_site_editor() {
	if ( ! is_site_editor_active() ) {
		return;
	}

	// Force enable required Gutenberg experiments if they are not already active.
	add_filter(
		'option_gutenberg-experiments',
		function( $experiments_option ) {
			if ( empty( $experiments_option['gutenberg-full-site-editing'] ) ) {
				$experiments_option['gutenberg-full-site-editing'] = 1;
			}

			if ( empty( $experiments_option['gutenberg-full-site-editing-demo'] ) ) {
				$experiments_option['gutenberg-full-site-editing-demo'] = 1;
			}

			return $experiments_option;
		}
	);

	add_action( 'admin_menu', 'gutenberg_menu' );
	do_action( 'enqueue_block_editor_assets' );
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

	/**
	 * Can be used to disable Site Editor functionality.
	 *
	 * @since 0.22
	 *
	 * @param bool true if Site Editor should be disabled, false otherwise.
	 */
	$is_active = ! apply_filters( 'a8c_disable_core_site_editor', false );

	if ( $should_switch ) {
		restore_current_blog();
	}
	return $is_active;
}
