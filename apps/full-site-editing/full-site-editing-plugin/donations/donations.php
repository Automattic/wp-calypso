<?php
/**
 * Donations block
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Earn\Donations;

/**
 * Initialize the Donations block for the editor.
 */
function fse_donations_enqueue_for_editor() {
	$gate = apply_filters( 'wpcom_donations_block_init', false );
	if ( ! $gate ) {
		return;
	}

	$asset_file = include plugin_dir_path( __FILE__ ) . 'dist/donations.asset.php';

	wp_enqueue_script(
		'a8c-donations',
		plugins_url( 'dist/donations.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);
}

add_action( 'enqueue_block_editor_assets', 'A8C\FSE\Earn\Donations\fse_donations_enqueue_for_editor' );

/**
 * Enqueue Donations styles in the editor and on the front-end when a Donations block is present.
 */
function fse_donations_enqueue_styles() {
	$gate = apply_filters( 'wpcom_donations_block_init', false );
	if ( ! $gate ) {
		return;
	}

	if ( ! is_admin() && ! has_block( 'a8c/donations' ) ) {
		return;
	}

	$asset_file = include plugin_dir_path( __FILE__ ) . 'dist/donations.asset.php';

	wp_enqueue_style(
		'a8c-donations',
		plugins_url( 'dist/donations.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/donations.css' )
	);
}

add_action( 'enqueue_block_assets', 'A8C\FSE\Earn\Donations\fse_donations_enqueue_styles' );
