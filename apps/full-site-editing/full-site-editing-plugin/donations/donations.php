<?php
/**
 * Donations block
 *
 * @package A8C\FSE
 */

namespace A8C\FSE\Earn\Donations;

/**
 * Initialize the Donations block.
 */
function fse_donations_block() {
	$asset_file = include plugin_dir_path( __FILE__ ) . 'dist/donations.asset.php';

	wp_enqueue_script(
		'donations',
		plugins_url( 'dist/donations.js', __FILE__ ),
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);
}

add_action( 'init', 'A8C\FSE\Earn\Donations\fse_donations_block' );
