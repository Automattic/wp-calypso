<?php
/**
 * Event Countdown Block
 *
 * @package A8C\FSE
 */

add_action(
	'init',
	function () {

		$asset_file   = __DIR__ . '/dist/event-countdown-block.asset.php';
		$asset        = file_exists( $asset_file ) ? require $asset_file : null;
		$dependencies = isset( $asset['dependencies'] ) ? $asset['dependencies'] : array();
		$version      = isset( $asset['version'] ) ? $asset['version'] : filemtime( __DIR__ . '/dist/event-countdown-block.min.js' );

		$style_file = is_rtl()
		? 'event-countdown-block.rtl.css'
		: 'event-countdown-block.css';

		wp_register_style(
			'jetpack-event-countdown-style',
			plugins_url( 'dist/' . $style_file, __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'dist/' . $style_file )
		);

		// Block JS.
		wp_register_script(
			'jetpack-event-countdown',
			plugins_url( 'dist/event-countdown-block.min.js', __FILE__ ),
			$dependencies,
			$version,
			true
		);

		// JavaScript that triggers countdown on front-end.
		wp_register_script(
			'jetpack-event-countdown-js',
			plugins_url( 'event-countdown.js', __FILE__ ),
			array(), // No dependencies.
			filemtime( plugin_dir_path( __FILE__ ) . 'event-countdown.js' ),
			true // In footer.
		);

		register_block_type(
			'jetpack/event-countdown',
			array(
				'editor_script'   => 'jetpack-event-countdown',
				'editor_style'    => 'jetpack-event-countdown-style',
				'render_callback' => function ( $attribs, $content ) {
					wp_enqueue_style( 'jetpack-event-countdown-style' );
					wp_enqueue_script( 'jetpack-event-countdown-js' );
					return $content;

				},
			)
		);

		wp_set_script_translations( 'jetpack-event-countdown', 'full-site-editing' );

	}
);

