<?php
/**
 * Event Countdown Block
 *
 * @package A8C\FSE
 */

add_action(
	'init',
	function() {
		\A8C\FSE\use_webpack_assets( 'event-countdown-block', array( 'register_only' => true ) );

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
				'editor_script'   => 'a8c-etk-event-countdown-block',
				'editor_style'    => 'a8c-etk-event-countdown-block',
				'render_callback' => function( $attribs, $content ) { // phpcs:ignore
					wp_enqueue_style( 'a8c-etk-event-countdown-block' );
					wp_enqueue_script( 'jetpack-event-countdown-js' );
					return $content;

				},
			)
		);
	}
);

