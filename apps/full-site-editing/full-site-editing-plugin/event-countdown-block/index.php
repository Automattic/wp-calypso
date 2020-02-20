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

		// Block front end style.
		wp_register_style(
			'jetpack-event-countdown',
			plugins_url( 'style.css', __FILE__ ),
			array(),
			filemtime( __DIR__ . '/style.css' )
		);

		// Block editor style.
		wp_register_style(
			'jetpack-event-countdown-editor',
			plugins_url( 'editor.css', __FILE__ ),
			array(),
			filemtime( __DIR__ . '/editor.css' )
		);

		wp_set_script_translations( 'jetpack-event-countdown', 'full-site-editing' );
	}
);

/**
 * AUTO-GENERATED blocks will be added here
 */

require_once __DIR__ . '/blocks/event-countdown.php';
