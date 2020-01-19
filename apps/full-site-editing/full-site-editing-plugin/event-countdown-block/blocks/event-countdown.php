<?php

add_action( 'init', function() {
	if ( ! WP_Block_Type_Registry::get_instance()->is_registered( 'jetpack/event-countdown' ) ) {
		register_block_type( 'jetpack/event-countdown', [
			'editor_script' => 'jetpack-event-countdown',
			'style' => 'jetpack-event-countdown',
			'editor_style' => 'jetpack-event-countdown-editor',
		] );
	}
} );

add_action( 'wp_enqueue_scripts', function() {
	wp_enqueue_script(
		'event-countdown-js',
		plugins_url( 'event-countdown.js', __FILE__ ),
		[], // no dependencies
		filemtime( plugin_dir_path( __FILE__ ) . 'event-countdown.js' ),
		true // in footer
	);
} );
