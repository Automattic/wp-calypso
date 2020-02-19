<?php
/**
 * Timeline Block
 *
 * @package A8C\FSE
 */

// Register Block Scripts.
add_action(
	'init',
	function() {
		$asset_file   = __DIR__ . '/dist/jetpack-timleine.asset.php';
		$asset        = file_exists( $asset_file ) ? require_once $asset_file : null;
		$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array();
		$version      = isset( $asset['version'] ) ? $asset['version'] : filemtime( __DIR__ . '/index.js' );

		// Block JS.
		wp_register_script(
			'jetpack-timeline',
			plugins_url( 'dist/jetpack-timeline.js', __FILE__ ),
			$dependencies,
			$version,
			true
		);

		// Block front end style.
		wp_register_style(
			'jetpack-timeline',
			plugins_url( 'style.css', __FILE__ ),
			array(),
			filemtime( __DIR__ . '/style.css' )
		);

		// Block editor style.
		wp_register_style(
			'jetpack-timeline-editor',
			plugins_url( 'editor.css', __FILE__ ),
			array(),
			filemtime( __DIR__ . '/editor.css' )
		);
	}
);

/**
 * AUTO-GENERATED blocks will be added here
 */

require_once __DIR__ . '/blocks/timeline.php';
