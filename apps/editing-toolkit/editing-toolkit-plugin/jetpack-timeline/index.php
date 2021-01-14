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
		\A8C\FSE\use_webpack_assets( 'jetpack-timeline', array( 'register_only' => true ) );

		// Register block.
		register_block_type(
			'jetpack/timeline',
			array(
				'editor_script'   => 'a8c-etk-jetpack-timeline',
				'editor_style'    => 'a8c-etk-jetpack-timeline',
				'render_callback' => function( $attribs, $content ) { // phpcs:ignore
					wp_enqueue_style( 'a8c-etk-jetpack-timeline' );
					return $content;
				},
			)
		);

		// Allow vars for CSS props.
		add_filter(
			'safe_style_css',
			function( $attr ) {
				$attr[] = '--timeline-background-color';
				$attr[] = '--timeline-text-color';
				return $attr;
			},
			10,
			2
		);
	}
);

