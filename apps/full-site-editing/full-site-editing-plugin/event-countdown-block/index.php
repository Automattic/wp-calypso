<?php
/**
 * Event Countdown Block
 *
 * @package A8C\FSE
 */

add_action(
	'init',
	function() {

		$asset_file   = __DIR__ . '/dist/event-countdown-block.asset.php';
		$asset        = file_exists( $asset_file ) ? require_once $asset_file : null;
		$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array();
		$version      = isset( $asset['version'] ) ? $asset['version'] : filemtime( __DIR__ . '/dist/event-countdown-block.js' );

		// Block JS.
		wp_register_script(
			'jetpack-event-countdown',
			plugins_url( 'dist/event-countdown-block.js', __FILE__ ),
			$dependencies,
			$version,
			true
		);

		register_block_type(
			'jetpack/event-countdown',
			array(
				'editor_script' => 'jetpack-event-countdown',
			)
		);

		wp_set_script_translations( 'jetpack-event-countdown', 'full-site-editing' );

	}
);


// Load block assets.
add_action(
	'enqueue_block_assets',
	function() {

		$style_file = is_rtl()
		? 'event-countdown-block.rtl.css'
		: 'event-countdown-block.css';

		wp_enqueue_style(
			'event-countdown-block',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);

	}
);

// JavaScript that triggers countdown on front-end.
add_action(
	'wp_enqueue_scripts',
	function() {
		wp_enqueue_script(
			'event-countdown-js',
			plugins_url( 'event-countdown.js', __FILE__ ),
			array(), // No dependencies.
			filemtime( plugin_dir_path( __FILE__ ) . 'event-countdown.js' ),
			true // In footer.
		);
	}
);
