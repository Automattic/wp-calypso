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

	wp_enqueue_style(
		'a8c-donations',
		plugins_url( 'dist/donations.css', __FILE__ ),
		array(),
		filemtime( plugin_dir_path( __FILE__ ) . 'dist/donations.css' )
	);

	register_block_type(
		'a8c/donations',
		array(
			'editor_script'   => 'jetpack-event-countdown',
			'editor_style'    => 'jetpack-event-countdown-style',
			'render_callback' => function( $attribs, $content ) {
				return '<div class="wp-block-a8c-donations">Donations Placeholder</div>';
			},
		)
	);
}

add_action( 'init', 'A8C\FSE\Earn\Donations\fse_donations_block' );
