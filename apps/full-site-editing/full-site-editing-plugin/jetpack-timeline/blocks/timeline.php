<?php

add_action( 'init', function() {
	// prevent a second instance trying to register the same block
	if ( ! WP_Block_Type_Registry::get_instance()->is_registered( 'jetpack/timeline' ) ) {
		register_block_type( 'jetpack/timeline', [
			'editor_script' => 'jetpack-timeline',
			'style' => 'jetpack-timeline',
			'editor_style' => 'jetpack-timeline-editor',
		] );
	}

	add_filter( 'safe_style_css', function( $attr ) {
		$attr[] = '--timeline-background-color';
		$attr[] = '--timeline-text-color';
		return $attr;
	}, 10, 2);
} );
